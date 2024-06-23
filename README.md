# Trabalho Nº 3

## Gestão de Identidade Avançada

### Tema 2

O objetivo deste tema é realizar uma prova de conceito para demonstrar a autenticação com
o protocolo WebAuthn / PassKey, em conjunto com uma outra baseada em OAuth2, com
gestão integrada dos perfis de utilizador.

Para a realização desta prova de conceito, deverão previamente ser realizados os seguintes
passos:

- Compreensão do funcionamento do protocolo de autenticação Passwordless
WebAuthn, cujo princípio de funcionamento foi descrito nas aulas (Ver [Cap. II](https://moodle.ensinolusofona.pt/pluginfile.php/829828/mod_resource/content/0/IM-02-IdMgmt.pdf) - slides
20 - 22), sendo aconselhável ler com atenção a documentação disponibilizadas no
site do [WebAuthn](https://webauthn.guide/).
- Para uma experimentação rápida desta funcionalidade, sugere-se testar o [exemplo](https://webauthn.io/)
fornecido online e analisar exemplos de código em várias linguagens (aqui em
[JavaScript](https://github.com/fido-alliance/webauthn-demo)).
- Para uma boa compreensão da extensão do WebAuthn ao conceito de Passkey, que
que será utilizado neste trabalho, é aconselhável ler esta [documentação](https://developers.google.com/identity/passkeys?hl=pt-br) da Google
sobre o tema, pois foi um dos primeiros a implementar o conceito. A Microsoft, a
Apple, e o Github (e muitos mais…) também suportam este protocolo.
- Para a realização deste trabalho, sugere-se partir do Trabalho Nº2, ao qual deverá
ser adicionada **a nova strategy** [passport-fido-webauthn](https://www.passportjs.org/packages/passport-fido2-webauthn/), que implementa o protocolo
WebAuthn / Passkey como autenticação.
- Na página da [passport-fido-webauthn](https://www.passportjs.org/packages/passport-fido2-webauthn/) é fornecido um [exemplo de implementação](https://github.com/passport/todos-express-webauthn/tree/master)
com esta biblioteca, que pode ser utilizado como uma referência para a extensão a
desenvolver. É recomendado instalá-lo e tentar perceber como funciona, mas como
as funcionalidades deste exemplo são restritas, é recomendado ter algum cuidado na
reutilização desse código.
- Aconselha-se também a leitura deste [blog](https://www.corbado.com/blog/how-to-delete-passkeys-windows-10), que explica a forma como são geradas e
armazenadas no Windows as chaves associadas às PassKeys. Fornece também
uma ferramenta para listar e remover PassKeys já armazenadas.
- Para a implementação, sugere-se partir do código do Trabalho Nº2 e adicionar
progressivamente as novas funcionalidades. Se o código estiver no Github, é
aconselhável fazer um fork antes de o começar a modificar.

Uma vez compreendidos e realizados estes pontos, descrevem-se seguidamente as
funcionalidades que deverão ser implementadas neste tema do Trabalho 3.

- Como pode ser visto no exemplo acima referido, é necessário adicionar uma nova
strategy associada à autenticação com PassKeys (ver o ficheiro *routes/auth.js*).
- É, portanto, necessário adicionar novas rotas para os passos de registo, autenticação
e challenge, assim como as forms ejs associadas, para as quais podem ser utilizadas
como base as do exemplo fornecido.
- Uma forma de agregar uma strategy de autenticação com uma strategy de
autorização é explicada [nesta documentação](https://www.passportjs.org/concepts/delegated-authorization/) do Passport.
- É de salientar que a gestão das PassKeys necessita da colaboração do ambiente de
execução do browser e do Windows, que é responsável pelo armazenamento seguro
e utilização da chave privada do utilizador. O código JavaScript que realiza a
interação com o browser está localizado na pasta *public/js*, devendo ser migrado
para a vossa aplicação. Como corre no browser, é invocado diretamente nas forms
ejs (ver ficheiros *login.ejs* e *signup.ejs* na pasta *views*), sob a forma de um
*EventListener*.
- Tendo em conta este contexto, a aplicação deverá implementar as seguintes
funcionalidades:

1. A página de autenticação da aplicação deve começar por sugerir entrar com o
perfil Google, ou com uma passkey que, numa fase inicial, não existe.
2. Assim, como não existe passkey registada, a autenticação deverá ser feita
com a conta Gmail, o que leva à criação de um utilizador local com o perfil
importado (já realizado no Trabalho Nº1).
3. Depois da autenticação, deve ser proposto ao utilizador, logo na página de
success, a criação e registo de uma PassKey , através de um link para a rota
de *signup* . Esta passkey irá ficar associada ao perfil do utilizador.
4. Ao entrar nessa rota, é apresentado ao utilizador uma form para associação
ao perfil, que deverá ter campos para um nome de utilizador (fullname) e um
email, devendo idealmente a form já vir pré preenchida com essa informação,
extraída do perfil do utilizador autenticado no ponto 1.
5. Ao escolher essa opção, quando é acionado o botão submit, o browser irá
abrir um pop-up onde pergunta que tipo de PassKey o utilizador quer criar.
Numa primeira fase, deverá ser escolhido o Windows Hello.
6. Ao submeter essa informação, a rota de registo deve começar por procurar um
utilizador já existente na Base de Dados, usando o email fornecido como índex
de procura.
7. No caso de o utilizador existir, a chave pública gerada pelo suporte de
autenticação do Windows deverá ser transferida para o servidor e ser
armazenada num novo campo do perfil do utilizador já criado (ver código do
exemplo no ficheiro *routes/auth.js*).
8. Simultaneamente, o browser invoca o sistema operativo para armazenar a
Passkey do tipo escolhido, no contexto de autenticação local do utilizador.
Esta PassKey só pode depois ser utilizada mediante a autenticação biométrica
(eventualmente também um PIN) que o utilizador utiliza para entrar no seu
sistema (e.g.: Windows Hello).
9. A partir do registo desta nova forma de autenticação, quando o utilizador
entrar no site sem estar autenticado, já pode escolher o login com PassKey. O
browser sugere-lhe então a PassKey armazenada, e se for aceite, será ativado
o protocolo de autenticação do WebAuthn.
10. A chave pública armazenada no perfil do utilizador (ponto 7) é utilizada para
validar o challenge que o browser irá assinar.
11. Depois de autenticado, o utilizador será admitido com o seu perfil do Google,
tendo acesso a todos os itens que já tiver criado anteriormente.

A entrega deste trabalho deverá ser realizada até **24 de Junho de 2024**, devendo a sua
defesa decorrer até **28 de Junho de 2024**.
 
A demonstração das funcionalidades implementadas poderá ser realizada on-line.
