const URL_API = 'https://fakestoreapi.com/products';

// ---------- Produtos ----------
async function retornoApi() {
    try {
        const response = await fetch(URL_API);
        const conteudo = await response.json();
        renderizarProdutos(conteudo);
    } catch (erro) {
        document.getElementById('lista-produtos').innerHTML = '<p>Não foi possível carregar os produtos.</p>';
    }
}

function renderizarProdutos(produtos) {
    let saida = '';
    for (let produto of produtos) {
        if (produto.category === 'electronics') {
            saida += `
            <div class="card">
                <img src="${produto.image}" alt="${produto.title}"/>
                <h3>${produto.title}</h3>
                <p class="preco">R$ ${produto.price}</p>
                <p class="avaliacoes">${produto.rating.count} avaliações</p>
                <button class="botao-comprar" onclick="comprar()">COMPRAR</button>
            </div>`;
        }
    }
    document.getElementById('lista-produtos').innerHTML = saida;
}

function comprar() {
    alert('Produto adicionado ao carrinho!');
}

retornoApi();

// ---------- Formulário de contato ----------
document.getElementById('form-contato').addEventListener('submit', function (e) {
    e.preventDefault();
    const retorno = document.getElementById('retorno-form');
    const nome = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value.trim();
    const mensagem = document.getElementById('mensagem').value.trim();

    if (!nome || !email.includes('@') || !mensagem) {
        retorno.className = 'erro';
        retorno.textContent = 'Preencha nome, e-mail válido e mensagem.';
        return;
    }
    retorno.className = 'ok';
    retorno.textContent = `Obrigado, ${nome}! Recebemos sua mensagem.`;
    this.reset();
});

// ---------- Chat lateral com IA ----------
let botao = document.getElementById("chat-toggle");
let chat = document.getElementById("chat");
let fechar = document.getElementById("fechar");
let enviarBtn = document.getElementById("enviar");
let input = document.getElementById("input");
let chatBox = document.getElementById("chat-box");

// Código único deste visitante: o servidor usa para lembrar a conversa.
const sessionId = crypto.randomUUID();

botao.addEventListener("click", function () {
    chat.classList.toggle("hidden");
    input.focus();
});

fechar.addEventListener("click", function () {
    chat.classList.add("hidden");
});

enviarBtn.addEventListener("click", enviar);

input.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
        enviar();
    }
});

// Cria um balão no chat. tipo = "usuario" | "bot" | "erro"
function adicionarMensagem(tipo, texto) {
    let div = document.createElement("div");
    div.className = tipo;
    // textContent mostra texto puro (não executa HTML digitado pelo usuário)
    div.textContent = texto;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
    return div;
}

// async permite usar await (esperar a IA sem travar a página)
async function enviar() {
    let texto = input.value.trim();
    if (texto === "") return;

    adicionarMensagem("usuario", texto);
    input.value = "";

    // bloqueia o envio enquanto espera
    input.disabled = true;
    enviarBtn.disabled = true;
    let digitando = adicionarMensagem("bot", "Digitando...");

    try {
        // pergunta ao NOSSO servidor (a chave fica lá, nunca no navegador)
        let respostaHTTP = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ mensagem: texto, sessionId: sessionId })
        });

        let dados = await respostaHTTP.json();

        if (!respostaHTTP.ok) {
            throw new Error(dados.erro || "Erro " + respostaHTTP.status);
        }

        digitando.remove();
        adicionarMensagem("bot", dados.resposta);
    } catch (erro) {
        digitando.remove();
        adicionarMensagem("erro", "Ops! Não consegui responder agora. 😕 (" + erro.message + ")");
        console.error(erro);
    } finally {
        input.disabled = false;
        enviarBtn.disabled = false;
        input.focus();
    }
}
