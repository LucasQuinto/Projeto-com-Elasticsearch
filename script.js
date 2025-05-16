// Este trecho de código é executado quando o DOM (Document Object Model) é completamente carregado.
document.addEventListener('DOMContentLoaded', function () {
    // Obtém referências aos elementos HTML relevantes
    const inputField = document.getElementById('searchInput');
    const suggestionsContainer = document.getElementById('suggestions');
    const searchResultsContainer = document.getElementById('searchResults');

    // Define o nome de usuário e senha para autenticação básica
    const username = 'elastic';
    const password = 'YvtU-BJ_*NTEKf4wJ=4K';

    // Configura os cabeçalhos da requisição HTTP com as credenciais de autenticação e o tipo de conteúdo JSON
    const headers = new Headers();
    headers.set('Authorization', 'Basic ' + btoa(username + ":" + password));
    headers.set('Content-Type', 'application/json');

    // Adiciona um ouvinte de evento de entrada para o campo de entrada de busca
    inputField.addEventListener('input', function () {
        const userInput = this.value.trim(); // Remove espaços em branco extras

        // Verifica se há entrada do usuário
        if (userInput.length > 0) {
            fetchSuggestions(userInput); // Se houver, busca sugestões com base na entrada do usuário
        } else {
            suggestionsContainer.innerHTML = ""; // Limpa sugestões se a entrada estiver vazia
            suggestionsContainer.style.display = "none";
        }
    });

    // Adiciona um ouvinte de evento de clique para o contêiner de sugestões
    suggestionsContainer.addEventListener('click', function (event) {
        const clickedSuggestion = event.target.textContent;
        inputField.value = clickedSuggestion; // Preenche o campo de entrada com a sugestão clicada
        fetchSearchResults(clickedSuggestion); // Busca resultados de busca com base na sugestão clicada
        suggestionsContainer.style.display = "none"; // Oculta sugestões após clicar em uma
    });

    // Função assíncrona para buscar sugestões com base na entrada do usuário
    async function fetchSuggestions(userInput) {
        try {
            const response = await fetch(`http://localhost:9200/banco/_search`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    "query": {
                        "prefix": {
                            "nome": userInput
                        }
                    }
                })
            });
            const data = await response.json();

            // Verifica se há sugestões retornadas pela busca
            if (data.hits && data.hits.hits.length >= 1) {
                // Extrai os nomes das sugestões dos resultados da busca
                const suggestions = data.hits.hits.map(hit => hit._source.nome);
                // Cria HTML para exibir as sugestões
                const suggestionsHtml = suggestions.map(suggestion => `<li>${suggestion}</li>`).join("");
                suggestionsContainer.innerHTML = suggestionsHtml; // Exibe as sugestões
                suggestionsContainer.style.display = "block";
            } else {
                suggestionsContainer.innerHTML = "No suggestions found"; // Exibe mensagem de sugestões não encontradas
                suggestionsContainer.style.display = "none";
            }
        } catch (error) {
            console.error('Error fetching suggestions:', error); // Registra erro se houver problema ao buscar sugestões
            suggestionsContainer.innerText = "Error fetching suggestions"; // Exibe mensagem de erro
        }
    }

    // Função assíncrona para buscar resultados de busca com base na consulta do usuário
    async function fetchSearchResults(query) {
        try {
            const response = await fetch(`http://localhost:9200/banco/_search`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    "query": {
                        "match": {
                            "nome": query
                        }
                    }
                })
            });
            const data = await response.json();

            // Verifica se há resultados de busca retornados pela consulta
            if (data.hits && data.hits.hits.length > 0) {
                // Extrai os dados do primeiro resultado retornado
                const source = data.hits.hits[0]._source;

                // Formata os dados para exibição
                const formattedData = `
    <div class="search-result">
        <strong id ="nome">Nome: </strong> ${source.nome}<br><br>
        <strong>Tipo: </strong> ${source.tipo}<br><br>
        <strong>Sistemas que funciona: </strong> ${source.sistemas_que_funciona}<br><br>
        <strong>Descrição: </strong> ${source.descricao}<br><br>
        <strong>Link: </strong> ${source.link}<br>
    </div>
`;

                // Exibe os dados formatados
                searchResultsContainer.innerHTML = formattedData;
                searchResultsContainer.style.display = "block";
            } else {
                searchResultsContainer.innerHTML = "No data found"; // Exibe mensagem de nenhum dado encontrado
                searchResultsContainer.style.display = "none";
            }
        } catch (error) {
            console.error('Error fetching search results:', error); // Registra erro se houver problema ao buscar resultados de busca
            searchResultsContainer.innerText = "Error fetching search results"; // Exibe mensagem de erro
        }
    }
});

