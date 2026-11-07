#!/usr/bin/env python3
"""Teste OAuth e leitura Bling, sem persistir tokens ou alterar dados da conta."""
import base64
import json
from pathlib import Path
import secrets
import urllib.error
import urllib.parse
import urllib.request


def request_json(url, headers, data=None):
    request = urllib.request.Request(url, headers=headers, data=data)
    with urllib.request.urlopen(request, timeout=20) as response:
        return response.status, json.load(response)


def main():
    env = {}
    for line in (Path(__file__).resolve().parents[1] / '.env').read_text().splitlines():
        if line.strip() and not line.lstrip().startswith('#') and '=' in line:
            key, value = line.split('=', 1)
            env[key.strip()] = value.strip().strip('\"\'')
    for key in ('BLING_CLIENT_ID', 'BLING_CLIENT_SECRET', 'BLING_OAUTH_AUTHORIZE_URL', 'BLING_OAUTH_TOKEN_URL', 'BLING_API_BASE_URL'):
        if not env.get(key):
            raise ValueError(f'Preencha {key} no .env.')
    state = secrets.token_urlsafe(32)
    query = urllib.parse.urlencode({'response_type': 'code', 'client_id': env['BLING_CLIENT_ID'], 'state': state})
    print('Abra este link e autorize a aplicação na Bling:\n')
    print(env['BLING_OAUTH_AUTHORIZE_URL'] + '?' + query)
    print('\nApós autorizar, cole imediatamente a URL completa de retorno (o código dura 30 segundos).')
    callback = input('URL: ').strip()
    expected = urllib.parse.urlsplit(env.get('BLING_REDIRECT_URI', ''))
    actual = urllib.parse.urlsplit(callback)
    if (actual.scheme, actual.netloc, actual.path) != (expected.scheme, expected.netloc, expected.path):
        raise ValueError('O endereço de retorno não corresponde ao callback configurado.')
    params = urllib.parse.parse_qs(actual.query)
    if params.get('state') != [state]:
        raise ValueError('State inválido; use o link gerado nesta execução.')
    if 'error' in params or not params.get('code'):
        raise ValueError('Autorização recusada ou retorno sem code.')
    credentials = base64.b64encode((env['BLING_CLIENT_ID'] + ':' + env['BLING_CLIENT_SECRET']).encode()).decode()
    status, token = request_json(env['BLING_OAUTH_TOKEN_URL'], {
        'Authorization': 'Basic ' + credentials,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
    }, urllib.parse.urlencode({'grant_type': 'authorization_code', 'code': params['code'][0]}).encode())
    print(f'OAuth: HTTP {status}; token recebido (não exibido nem salvo).')
    status, result = request_json(env['BLING_API_BASE_URL'].rstrip('/') + '/produtos?pagina=1&limite=1', {
        'Authorization': 'Bearer ' + token['access_token'], 'Accept': 'application/json',
    })
    print(f'Conexão confirmada: GET /produtos HTTP {status}; {len(result.get("data", []))} produto(s) retornado(s).')


if __name__ == '__main__':
    try:
        main()
    except urllib.error.HTTPError as error:
        print(f'Falha HTTP {error.code}.')
        try:
            payload = json.loads(error.read())
            detail = payload.get('error', {})
            kind = detail.get('type') if isinstance(detail, dict) else detail
            # Apenas códigos conhecidos; nunca imprimir payloads que possam conter segredos.
            known = {'invalid_grant', 'invalid_client', 'invalid_request', 'insufficient_scope', 'invalid_token'}
            print('Erro OAuth:', kind if kind in known else 'consulte permissões e configuração da aplicação')
        except (ValueError, AttributeError):
            pass
        raise SystemExit(1)
    except (ValueError, OSError, KeyError, EOFError) as error:
        print('Teste interrompido:', str(error) if isinstance(error, ValueError) else type(error).__name__)
        raise SystemExit(1)
