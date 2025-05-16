document.addEventListener('DOMContentLoaded', function () {
    const inputField = document.getElementById('searchInput');
    const suggestionsContainer = document.getElementById('suggestions');
    const searchResultsContainer = document.getElementById('searchResults');
    const addButton = document.getElementById('addButton');

    const username = 'elastic';
    const password = 'VduKBP71d_FTC-W=sZIh';

    const headers = new Headers();
    headers.set('Authorization', 'Basic ' + btoa(username + ":" + password));
    headers.set('Content-Type', 'application/json');

    inputField.addEventListener('input', function () {
        const userInput = this.value.trim();

        if (userInput.length > 0) {
            fetchSuggestions(userInput);
        } else {
            suggestionsContainer.innerHTML = "";
            suggestionsContainer.style.display = "none";
        }
    });

    suggestionsContainer.addEventListener('click', function (event) {
        const clickedSuggestion = event.target.textContent;
        inputField.value = clickedSuggestion;
        fetchSearchResults(clickedSuggestion);
        suggestionsContainer.style.display = "none";
    });

    addButton.addEventListener('click', function () {
        const nome = document.getElementById('nomeInput').value.trim();
        const tipo = document.getElementById('tipoInput').value.trim();
        const sistemas = document.getElementById('sistemasInput').value.trim();
        const descricao = document.getElementById('descricaoInput').value.trim();
        const link = document.getElementById('linkInput').value.trim();

        if (nome && tipo && sistemas && descricao && link) {
            addToIndex({ nome, tipo, sistemas_que_funciona: sistemas, descricao, link });
        } else {
            alert('Todos os campos devem ser preenchidos');
        }
    });

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

            if (data.hits && data.hits.hits.length >= 1) {
                const suggestions = data.hits.hits.map(hit => hit._source.nome);
                const suggestionsHtml = suggestions.map(suggestion => `<li>${suggestion}</li>`).join("");
                suggestionsContainer.innerHTML = suggestionsHtml;
                suggestionsContainer.style.display = "block";
            } else {
                suggestionsContainer.innerHTML = "No suggestions found";
                suggestionsContainer.style.display = "none";
            }
        } catch (error) {
            console.error('Error fetching suggestions:', error);
            suggestionsContainer.innerText = "Error fetching suggestions";
        }
    }

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

            if (data.hits && data.hits.hits.length > 0) {
                const source = data.hits.hits[0]._source;
                const id = data.hits.hits[0]._id; // Get the document ID
                const formattedData = `
    <div class="search-result">
        <strong id="nome">Nome: </strong> ${source.nome}<br><br>
        <strong>Tipo: </strong> ${source.tipo}<br><br>
        <strong>Sistemas que funciona: </strong> ${source.sistemas_que_funciona}<br><br>
        <strong>Descrição: </strong> ${source.descricao}<br><br>
        <strong>Link: </strong> ${source.link}<br>
        <button class="deleteButton" data-id="${id}">Delete</button>
    </div>
`;

                searchResultsContainer.innerHTML = formattedData;
                searchResultsContainer.style.display = "block";

                // Add event listener for the delete button
                document.querySelector('.deleteButton').addEventListener('click', function () {
                    const documentId = this.getAttribute('data-id');
                    deleteDocument(documentId);
                });
            } else {
                searchResultsContainer.innerHTML = "No data found";
                searchResultsContainer.style.display = "none";
            }
        } catch (error) {
            console.error('Error fetching search results:', error);
            searchResultsContainer.innerText = "Error fetching search results";
        }
    }

    async function addToIndex(document) {
        try {
            const response = await fetch(`http://localhost:9200/banco/_doc`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(document)
            });
            if (response.ok) {
                alert('Documento adicionado com sucesso');
                clearInputFields();
            } else {
                alert('Erro ao adicionar documento');
            }
        } catch (error) {
            console.error('Error adding document:', error);
            alert('Erro ao adicionar documento');
        }
    }

    async function deleteDocument(documentId) {
        try {
            const response = await fetch(`http://localhost:9200/banco/_doc/${documentId}`, {
                method: 'DELETE',
                headers: headers
            });
            if (response.ok) {
                alert('Documento deletado com sucesso');
                searchResultsContainer.innerHTML = "";
                searchResultsContainer.style.display = "none";
            } else {
                alert('Erro ao deletar documento');
            }
        } catch (error) {
            console.error('Error deleting document:', error);
            alert('Erro ao deletar documento');
        }
    }

    function clearInputFields() {
        document.getElementById('nomeInput').value = '';
        document.getElementById('tipoInput').value = '';
        document.getElementById('sistemasInput').value = '';
        document.getElementById('descricaoInput').value = '';
        document.getElementById('linkInput').value = '';
    }
});
