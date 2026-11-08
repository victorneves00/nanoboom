# Nanoboom - Uma Explosão em Tecnologia

Nanoboom é uma loja virtual fictícia de eletrônicos que reúne apresentação institucional, catálogo de produtos, formulário de contato e uma atendente virtual baseada em Inteligência Artificial, chamada Nano.

Projeto desenvolvido para a 3ª Avaliação, Parte 1, da disciplina Desenvolvimento Web para IA, do Curso Superior de Tecnologia em Inteligência Artificial, 2º Período, Turno Tarde, da Faculdade Estadual Piauí Instituto de Tecnologia.

## Integrantes

- Victor Neves da Silva Sousa. GitHub: https://github.com/victorneves00
- Marcos Filipe Frazão Oliveira. GitHub: https://github.com/folipe70-creator
- Luana Magalhães Pereira. GitHub: https://github.com/luanamagalhaaes

## Público-alvo

Estudantes, profissionais de tecnologia e entusiastas de eletrônicos que buscam produtos de armazenamento e monitores com atendimento rápido.

## Tecnologias utilizadas

- HTML5, CSS3 com Flexbox e layout responsivo
- JavaScript executado no navegador
- Node.js e Express, responsáveis por servir o site e proteger a chave da API
- Google Gemini API, acessada pelo pacote oficial @google/genai
- dotenv, para leitura de variáveis de ambiente
- FakeStore API, fonte dos dados dos produtos
- Git e GitHub, para controle de versão

## Instalação e execução

### Pré-requisitos

- Git instalado
- Node.js na versão 20 ou superior, que inclui o npm
- Chave de API do Gemini, gerada gratuitamente no Google AI Studio, em https://aistudio.google.com/apikey

### Passo a passo

1. Clone o repositório e acesse a pasta do projeto.

```bash
git clone https://github.com/USUARIO/nanoboom.git
cd nanoboom
```

2. Instale as dependências listadas no package.json.

```bash
npm install
```

3. Crie, na raiz do projeto, junto ao arquivo server.js, um arquivo chamado exatamente .env com o conteúdo abaixo, substituindo o valor pela chave obtida no Google AI Studio, sem aspas e sem espaços.

```
GEMINI_API_KEY=sua_chave_aqui
```

4. Inicie o servidor.

```bash
npm start
```

5. Aguarde a mensagem de confirmação no terminal e acesse o site no navegador pelo endereço http://localhost:3000.

### Observações

- O site deve ser acessado obrigatoriamente pelo endereço do servidor. Abrir o arquivo index.html diretamente ou utilizar extensões como o Live Server impede o funcionamento do chat, pois a rota /api/chat é fornecida pelo servidor Node.
- O terminal deve permanecer aberto durante o uso. Para encerrar o servidor, utilize Ctrl e C.
- Alterações nos arquivos persona.js ou server.js exigem reiniciar o servidor.
- O arquivo .env é ignorado pelo Git e nunca deve ser enviado ao repositório.
- O arquivo pedidos.json é criado automaticamente quando o primeiro pedido é registrado pelo chat.
- O modelo do Gemini é definido na constante MODELO do arquivo server.js e pode ser alterado caso a API informe que o modelo não foi encontrado.
- Caso a porta 3000 esteja ocupada, altere a constante PORTA no arquivo server.js.
- A listagem de produtos e o chat dependem de conexão com a internet.

## Funcionalidades

- Cabeçalho com logomarca e menu de navegação funcional, com as opções Home, Sobre, Produtos e Contato
- Seções de banner, benefícios, Sobre, Produtos e Contato
- Cards de produtos construídos com Flexbox, carregados da FakeStore API e filtrados pela categoria electronics
- Formulário de contato com validação dos campos
- Layout responsivo para computadores e celulares
- Chat lateral com atendente virtual de IA, capaz de registrar pedidos

## Integração com Inteligência Artificial

O botão de chat abre a conversa com a Nano, atendente virtual da Nanoboom.

- Persona: atendente animada, simpática e objetiva, com respostas curtas. A persona, o conhecimento da loja e as regras de comportamento estão definidos no arquivo persona.js.
- Contexto: a Nano conhece produtos, benefícios e formas de contato, recusa assuntos alheios à loja e não inventa preços ou prazos.
- Fluxo: o script.js envia a mensagem por fetch para a rota POST /api/chat. O server.js monta a instrução de sistema a partir do persona.js, mantém o histórico da conversa por sessão e consulta o Gemini. A chave de API permanece apenas no servidor.
- Function calling: quando o cliente informa nome, telefone e o item desejado, a IA aciona a ferramenta registrar_pedido, e o servidor grava o pedido no arquivo pedidos.json.

## Estrutura de pastas

```
nanoboom/
├── public/
│   ├── index.html
│   ├── style.css
│   └── script.js
├── persona.js
├── server.js
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
```

- public: arquivos do site entregues ao navegador
- persona.js: persona, conhecimento e regras da Nano
- server.js: servidor Express e integração com o Gemini
- package.json e package-lock.json: dependências e scripts do projeto
- .gitignore: exclui node_modules, .env e pedidos.json do versionamento

## Observação

Loja fictícia criada exclusivamente para fins acadêmicos.