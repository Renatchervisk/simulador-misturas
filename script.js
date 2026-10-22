
document.addEventListener('DOMContentLoaded', function () {

    // Seleção dos elementos do HTML
    const reagente1 = document.getElementById('reagente1');
    const reagente2 = document.getElementById('reagente2');
    const resultado = document.getElementById('resultado');
    const liquid = document.getElementById('liquid');
    const bubbles = document.getElementById('bubbles');
    const waterStream = document.getElementById('water-stream');
    const btnMisturar = document.getElementById('btn-misturar');

    if (
        !reagente1 || !reagente2 || !resultado ||
        !liquid || !bubbles || !waterStream || !btnMisturar
    ) {
        console.error('Confira os IDs dos elementos no HTML.');
        return;
    }

    // Área visual dos reagentes ao redor do béquer
    const selecaoReagentes = document.querySelector('.selecao-reagentes');
    const beaker = document.querySelector('.beaker');
    const tap = document.querySelector('.tap');

    const imagensReagentes = {
        agua_sanitaria: {
            icone: '🧴',
            nome: 'Água sanitária',
            classe: 'bleach'
        },
        alcool: {
            icone: '🍾',
            nome: 'Álcool (etanol)',
            classe: 'alcohol'
        },
        agua_oxigenada: {
            icone: '🫙',
            nome: 'Água oxigenada',
            classe: 'peroxide'
        },
        vinagre: {
            icone: '🍶',
            nome: 'Vinagre',
            classe: 'vinegar'
        },
        amonia: {
            icone: '🧪',
            nome: 'Amônia',
            classe: 'ammonia'
        },
        limpa_vidros: {
            icone: '🥃',
            nome: 'Limpa-vidros',
            classe: 'glass-cleaner'
        }
    };

    let imagem1 = null;
    let imagem2 = null;

    if (selecaoReagentes && beaker && tap) {
        const palco = document.createElement('div');
        palco.className = 'reagentes-palco';

        imagem1 = document.createElement('div');
        imagem1.className =
            'imagem-reagente imagem-reagente-esquerda';
        imagem1.setAttribute('aria-live', 'polite');

        const centro = document.createElement('div');
        centro.className = 'centro-bequer';

        imagem2 = document.createElement('div');
        imagem2.className =
            'imagem-reagente imagem-reagente-direita';
        imagem2.setAttribute('aria-live', 'polite');

        const pai = beaker.parentNode;
        pai.insertBefore(palco, beaker);
        palco.append(imagem1, centro, imagem2);
        centro.append(tap, beaker);

        atualizarImagem(reagente1, imagem1);
        atualizarImagem(reagente2, imagem2);

        reagente1.addEventListener('change', () => {
            atualizarImagem(reagente1, imagem1);
        });

        reagente2.addEventListener('change', () => {
            atualizarImagem(reagente2, imagem2);
        });
    }

    function atualizarImagem(campo, destino) {
        if (!destino) return;

        const chave = normalizarReagente(campo.value);
        const item = imagensReagentes[chave];

        if (!campo.value || !item) {
            destino.innerHTML = '';
            destino.classList.remove('visivel');
            return;
        }

        destino.innerHTML = `
            <div class="frasco-ilustrado ${item.classe}" role="img"
                 aria-label="Ilustração de ${item.nome}">
                <span class="icone-frasco">${item.icone}</span>
            </div>
            <span class="nome-reagente-imagem">${item.nome}</span>
        `;

        destino.classList.add('visivel');
    }

    let temporizadorTanque = null;
    let temporizadorFluxo = null;
    let temporizadorResultado = null;
    let numeroMistura = 0;

    // Padroniza os valores dos reagentes
    function normalizarReagente(valor) {
        const nome = String(valor)
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]/g, '');

        if (nome.startsWith('alcool')) return 'alcool';
        if (nome.includes('aguasanitaria')) return 'agua_sanitaria';
        if (nome.includes('aguaoxigenada')) return 'agua_oxigenada';
        if (nome.includes('limpavidros')) return 'limpa_vidros';
        if (nome === 'amonia') return 'amonia';
        if (nome === 'vinagre') return 'vinagre';

        return nome;
    }

    // Cadastro das misturas: descrições e equações do arquivo original
    const reacoes = {
        'agua_sanitaria+vinagre': {
            descricao: 'Mistura altamente perigosa! Libera gases tóxicos (cloro).',
            reacao: 'NaClO + CH₃COOH → Cl₂ (gás cloro) + H₂O + NaCH₃COO',
            toxico: true,
            gas: true
        },

        'alcool+vinagre': {
            descricao: 'Mistura segura. Reação muito lenta, que pode liberar um odor forte de ésteres, mas não forma compostos tóxicos.',
            reacao: 'CH₃COOH + C₂H₅OH → CH₃COOCH₂CH₃ + H₂O',
            toxico: false,
            gas: false
        },

        'alcool+amonia': {
            descricao: 'Mistura perigosa! Nas condições ambientes,a reação é extremamente lenta.Porém, sob aquecimento,pode formar a etilamina que é altamente tóxica e corrosiva.',
            reacao: 'CH₃CH₂OH + NH₃ → CH₃CH₂NH₂+ H₂O.',
            toxico: true,
            gas: false
        },

        'agua_sanitaria+alcool': {
            descricao: 'Mistura altamente perigosa!Libera substâncias voláteis e tóxicas.Os vapores formados contém clorofórmio(CHCl₃),ácido clorídrico(HCl)e outros organoclorados.',
            reacao: '',
            toxico: true,
            gas: false
        },

        'alcool+limpa_vidros': {
            descricao: 'Mistura segura.Não ocorre reação química.',
            reacao: '',
            toxico: false,
            gas: false
        },

        'agua_sanitaria+amonia': {
            descricao: 'Mistura perigosa!Forma cloramina,um gás  tóxico,provoca tosse intensa, falta de ar e irritação nos olhos entre outros maleficios.',
            reacao: 'NaClO + NH₃ → NH₂Cl + NaOH',
            toxico: true,
            gas: true
        },

        'agua_oxigenada+vinagre': {
            descricao: 'Mistura perigosa! Pode formar ácido peracético, que é irritante e corrosivo.',
            reacao: 'H₂O₂ + CH₃COOH ⇌ CH₃COOOH + H₂O',
            toxico: true,
            gas: false
        },

        'agua_oxigenada+amonia': {
            descricao: 'Mistura segura,mas requer cuidados.A amônia forma uma solução alcalina que favorece a rápida decomposição da água oxigenada,formando gás oxigênio.Usada para clarear cabelos.',
            reacao: '2 H₂O₂ → 2 H₂O + O₂↑',
            toxico: true,
            gas: true
        },

        'agua_oxigenada+limpa_vidros': {
            descricao: 'Mistura perigosa!Em função da variabilidade da composição do limpa vidro,podem ocorrer reações com amonia ou álcool .',
            reacao: '',
            toxico: true,
            gas: false
        },

        'agua_oxigenada+alcool': {
            descricao: 'Mistura perigosa!Reação imperceptivél em baixas concentrações(água oxigenada 40 volumes),pode gerar reações exotérmicas violentas,podendo causar incêndios.',
            reacao: '',
            toxico: true,
            gas: false
        },

        'agua_sanitaria+limpa_vidros': {
            descricao: 'Mistura altamente tóxica!Libera cloraminas que provocam tosse,falta de ar,dor no peito e outros sintomas graves.',
            reacao: '',
            toxico: true,
            gas: false
        },

        'agua_oxigenada+agua_sanitaria': {
            descricao: 'Mistura perigosa!A reação não produz compostos tóxicos.Porém,a forte liberação de oxigênio pode causar respingos e machucar a pele.',
            reacao: 'NaClO + H₂O₂ → NaCl + H₂O + O₂↑',
            toxico: true,
            gas: true
        }
    };

    // Procura a mistura nos dois sentidos
    function verificarMistura(valor1, valor2) {
        const r1 = normalizarReagente(valor1);
        const r2 = normalizarReagente(valor2);

        return reacoes[`${r1}+${r2}`] ||
               reacoes[`${r2}+${r1}`] ||
               null;
    }

    // Limpa a simulação e cancela os temporizadores anteriores
    function limparSimulacao() {
        clearTimeout(temporizadorTanque);
        clearTimeout(temporizadorFluxo);
        clearTimeout(temporizadorResultado);

        temporizadorTanque = null;
        temporizadorFluxo = null;
        temporizadorResultado = null;

        liquid.style.height = '0';
        bubbles.innerHTML = '';
        waterStream.style.height = '0';
        resultado.innerHTML = '';
    }

    // Cria bolhas animadas
    function criarBolhas() {
        bubbles.innerHTML = '';

        for (let i = 0; i < 20; i++) {
            const bubble = document.createElement('div');

            bubble.className = 'bubble';
            bubble.style.left = `${Math.random() * 100}%`;
            bubble.style.animationDuration =
                `${2 + Math.random() * 3}s`;

            bubbles.appendChild(bubble);
        }
    }

    // Evento do botão Misturar
    btnMisturar.addEventListener('click', function () {

        // Limpa a simulação anterior
        limparSimulacao();
        const idAtual = ++numeroMistura;

        const valor1 = reagente1.value;
        const valor2 = reagente2.value;

        // Limpa os campos, mas mantém os ícones visíveis
        // até o resultado desaparecer.
        reagente1.value = '';
        reagente2.value = '';

        if (!valor1 || !valor2) {
            resultado.innerHTML =
                '<p>Por favor, selecione dois reagentes para misturar.</p>';
            return;
        }

        const r1 = normalizarReagente(valor1);
        const r2 = normalizarReagente(valor2);

        if (r1 === r2) {
            resultado.innerHTML =
                '<p><strong>Não há reação cadastrada:</strong> selecione dois reagentes diferentes.</p>';
            return;
        }

        const mistura = verificarMistura(valor1, valor2);

        if (!mistura) {
            resultado.innerHTML =
                '<p>Essa mistura ainda não está cadastrada no simulador.</p>';
            return;
        }

        // Inicia o fluxo da torneira
        waterStream.style.height = '100px';

        temporizadorFluxo = setTimeout(function () {
            if (idAtual !== numeroMistura) return;

            waterStream.style.height = '0';

            // Exibe o líquido no béquer
            liquid.style.height = '75%';
            liquid.style.backgroundColor =
                mistura.toxico ? 'red' : 'blue';

            // Mostra o resultado e a equação, se existir
            resultado.innerHTML = `
                <p><strong>Resultado da mistura:</strong>
                ${mistura.descricao}</p>
                ${mistura.reacao ? `
                    <p><strong>Equação química:</strong>
                    ${mistura.reacao}</p>
                ` : ''}
            `;

            if (mistura.gas) {
                criarBolhas();
            }

            // Após 10 segundos, limpa tanque, resultado e ícones
            temporizadorTanque = setTimeout(function () {
                if (idAtual !== numeroMistura) return;

                liquid.style.height = '0';
                bubbles.innerHTML = '';
                waterStream.style.height = '0';
                resultado.innerHTML = '';

                // Os ícones desaparecem junto com o resultado
                if (imagem1) {
                    imagem1.innerHTML = '';
                    imagem1.classList.remove('visivel');
                }

                if (imagem2) {
                    imagem2.innerHTML = '';
                    imagem2.classList.remove('visivel');
                }

                temporizadorTanque = null;

            }, 10000);

        }, 1000);
    });

});





    