# Fluxos de integração

## Lagom → Bling

A cada dez minutos, quando explicitamente homologado: consultar pré-ordens e sugestões elegíveis, validar identidade de tenant/documento e mapeamentos, persistir intenção/chave idempotente, transformar para o DTO confirmado, enviar pelo endpoint aprovado, confirmar o estado/ID no destino e só então avançar o checkpoint. Falhas ambíguas vão para reconciliação; não se repete POST automaticamente.

Nesta base, o fluxo está desligado. O pedido de compra Bling tem operações documentadas, mas a semântica do documento Lagom elegível, permissões, IDs relacionados e credenciais ainda carecem de homologação. A transferência de stock não possui endpoint nativo confirmado no Bling e permanece bloqueada.

## Bling → Lagom

Agendamento previsto diariamente às 20:00 em `America/Sao_Paulo`. Candidatos técnicos incluem produtos, contatos/fornecedores, depósitos, saldos e compras, mas nenhum recurso é sincronizado até aprovar a origem da verdade, destino, chave, regra de conflito e prevenção de loop. Produtos/contatos têm filtros de data de alteração no Bling; a API Lagom não documenta paginação geral no contrato consultado.

## Estados e confirmação

Estados do domínio: `PENDING`, `VALIDATING`, `PROCESSING`, `SENT`, `CONFIRMED`, `REJECTED`, `FAILED`, `UNKNOWN`, `RECONCILING`, `REPROCESSED`. Resposta HTTP isolada não significa sucesso de negócio. Só marcar `CONFIRMED` com ID retornado ou evidência equivalente definida pelo contrato. `UNKNOWN` exige reconciliação antes de retry.

## Loops

Manter direcções por entidade e chave externa. Documentos criados no Bling a partir do Lagom não devem regressar como documentos novos na carga reversa. Não actualizar campos de propriedade Lagom com valores Bling sem política explícita.