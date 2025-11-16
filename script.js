document.addEventListener('DOMContentLoaded', () => {
    let carrinho = [];

    // --- Seletores do DOM ---
    const botoesAdicionar = document.querySelectorAll('.acoes button');
    const carrinhoFlutuante = document.createElement('button');
    const carrinhoModalOverlay = document.createElement('div');
    
    // Configuração inicial do botão flutuante
    carrinhoFlutuante.className = 'carrinho-flutuante';
    carrinhoFlutuante.innerHTML = '🛒 <span id="contador-carrinho">0</span>';
    document.body.appendChild(carrinhoFlutuante);

    // Configuração inicial do Modal do Carrinho
    carrinhoModalOverlay.className = 'carrinho-modal-overlay';
    carrinhoModalOverlay.innerHTML = `
        <div class="carrinho-modal">
            <div class="carrinho-header">
                <h3>Seu Carrinho</h3>
                <button class="fechar-carrinho">×</button>
            </div>
            <div class="carrinho-lista" id="carrinho-lista">
                <p>Seu carrinho está vazio.</p>
            </div>
            <div class="carrinho-total">
                Total: <span id="carrinho-total-valor">R$ 0,00</span>
            </div>
            <button class="btn-finalizar" id="ir-para-pagamento" disabled>Ir para Pagamento</button>
        </div>
    `;
    document.body.appendChild(carrinhoModalOverlay);

    const carrinhoModal = document.querySelector('.carrinho-modal');
    const fecharCarrinho = document.querySelector('.fechar-carrinho');
    const carrinhoLista = document.getElementById('carrinho-lista');
    const contadorCarrinho = document.getElementById('contador-carrinho');
    const totalCarrinhoValor = document.getElementById('carrinho-total-valor');
    const btnIrParaPagamento = document.getElementById('ir-para-pagamento');
    const linkCarrinhoHeader = document.querySelector('header nav ul li a[href="#"]').closest('li');

    // --- Funções de Ajuda ---

    const parsePrice = (priceString) => {
        return parseFloat(priceString.replace('R$', '').replace(',', '.').trim());
    };

    const formatPrice = (price) => {
        return `R$ ${price.toFixed(2).replace('.', ',')}`;
    };

    // --- Lógica de Atualização do Carrinho ---

    const renderizarCarrinho = () => {
        carrinhoLista.innerHTML = '';
        let total = 0;
        let totalItens = 0;

        if (carrinho.length === 0) {
            carrinhoLista.innerHTML = '<p style="text-align: center; color: #666; padding-top: 20px;">Seu carrinho está vazio.</p>';
            contadorCarrinho.style.display = 'none';
            btnIrParaPagamento.disabled = true;
        } else {
            carrinho.forEach((item, index) => {
                const subtotal = item.preco * item.quantidade;
                total += subtotal;
                totalItens += item.quantidade;

                const itemDiv = document.createElement('div');
                itemDiv.className = 'item-carrinho';
                itemDiv.innerHTML = `
                    <div class="item-info">
                        <h4>${item.nome}</h4>
                        <p>${item.quantidade} x ${formatPrice(item.preco)} = ${formatPrice(subtotal)}</p>
                    </div>
                    <button class="remover-item" data-index="${index}">Remover</button>
                `;
                carrinhoLista.appendChild(itemDiv);
            });

            contadorCarrinho.innerText = totalItens;
            contadorCarrinho.style.display = 'flex';
            btnIrParaPagamento.disabled = false;
        }

        totalCarrinhoValor.innerText = formatPrice(total);
    };

    const adicionarAoCarrinho = (cardItem) => {
        const nome = cardItem.querySelector('h3').innerText;
        const precoTexto = cardItem.querySelector('.preco').innerText;
        const quantidadeInput = cardItem.querySelector('.acoes input[type="number"]');
        
        const preco = parsePrice(precoTexto);
        const quantidade = parseInt(quantidadeInput.value);

        if (quantidade > 0) {
            const itemExistente = carrinho.find(item => item.nome === nome);

            if (itemExistente) {
                itemExistente.quantidade += quantidade;
            } else {
                carrinho.push({ nome, preco, quantidade });
            }
            
            // Feedback visual
            const button = cardItem.querySelector('.acoes button');
            button.innerText = `Adicionado! (${quantidade})`;
            setTimeout(() => {
                button.innerText = (nome.includes("Suco") || nome.includes("Coca") || nome.includes("Água")) 
                    ? 'Adicionar' 
                    : 'Adicionar ao Carrinho';
            }, 800);
            
            quantidadeInput.value = 1; // Reseta a quantidade

            renderizarCarrinho();
        }
    };

    const removerItem = (index) => {
        carrinho.splice(index, 1);
        renderizarCarrinho();
    };

    // --- Lógica do Modal e Botões ---

    const abrirCarrinho = () => {
        carrinhoModalOverlay.style.display = 'block';
        setTimeout(() => {
            carrinhoModal.classList.add('aberto');
        }, 10);
    };

    const fecharCarrinhoModal = () => {
        carrinhoModal.classList.remove('aberto');
        setTimeout(() => {
            carrinhoModalOverlay.style.display = 'none';
        }, 400);
    };

    const irParaPagamento = () => {
        fecharCarrinhoModal();
        // Rola suavemente para a seção de pagamento
        const metPagSection = document.getElementById('met-pag');
        if (metPagSection) {
            window.scrollTo({
                top: metPagSection.offsetTop - 100,
                behavior: 'smooth'
            });
        }
        // Em um sistema real, aqui você preencheria um formulário de resumo do pedido
    };

    // --- Event Listeners ---

    // 1. Botões de Adicionar
    botoesAdicionar.forEach(button => {
        button.addEventListener('click', (event) => {
            const cardItem = event.target.closest('.carditem');
            adicionarAoCarrinho(cardItem);
        });
    });

    // 2. Botões de Remover (Delegação de Eventos)
    carrinhoLista.addEventListener('click', (event) => {
        if (event.target.classList.contains('remover-item')) {
            const index = event.target.getAttribute('data-index');
            removerItem(index);
        }
    });

    // 3. Abrir Carrinho
    carrinhoFlutuante.addEventListener('click', abrirCarrinho);
    linkCarrinhoHeader.addEventListener('click', (e) => {
        e.preventDefault();
        abrirCarrinho();
    });

    // 4. Fechar Carrinho
    fecharCarrinho.addEventListener('click', fecharCarrinhoModal);
    carrinhoModalOverlay.addEventListener('click', (e) => {
        if (e.target === carrinhoModalOverlay) {
            fecharCarrinhoModal();
        }
    });

    // 5. Ir para Pagamento
    btnIrParaPagamento.addEventListener('click', irParaPagamento);

    // 6. Navegação Suave (Links de seção)
    document.querySelectorAll('header nav a, .info nav a').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href.startsWith('#') && href !== '#') { // Ignora o link Carrinho por enquanto
                e.preventDefault();
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 100,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // 7. Inicialização
    renderizarCarrinho();
});