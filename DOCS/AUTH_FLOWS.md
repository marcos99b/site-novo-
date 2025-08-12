# AUTH FLOWS (Visão 360°)

## Estados
ANONYMOUS -> SIGNING_UP -> EMAIL_VERIFICATION_PENDING -> LOGGED_IN -> PROFILE_INCOMPLETE -> PROFILE_COMPLETE -> LOGGED_OUT

Erro global: AUTH_ERROR (mostra toast + log)

## Eventos principais
- sign_up_email/password
- sign_in_password
- sign_in_oauth_google
- magic_link
- email_verified
- forgot_password_requested
- password_reset_confirmed
- logout
- address_saved
- session_expired
- token_refreshed

## Telas/rotas envolvidas
- /login
- /signup
- /forgot
- /reset?token=...
- /callback (OAuth)
- /onboarding (com endereço)
- /account (editar dados)
- /logout (ação)

## Regras
- Após LOGGED_IN: se não tem endereço => redirecionar para /onboarding.
- RLS protege `profiles` e `addresses` por `auth.uid()`.
- Se sessão expira: pedir relogin preservando retorno.

Observação: OAuth Google é opcional neste projeto; a estrutura prevê o fluxo, mas pode permanecer desativado.
