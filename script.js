document.addEventListener('DOMContentLoaded', () => {
    let dictionaryData = [];
    let currentFilter = {
        branch: '',
        language: 'Polski',
        letter: ''
    };

    const dictionaryBody = document.getElementById('dictionary-body');
    const filterBranch = document.getElementById('filter-branch');
    const sortLanguage = document.getElementById('sort-language');
    const alphabetFilter = document.getElementById('alphabet-filter');

    // Funkcja do wczytywania danych z pliku JSON
    async function loadDictionary() {
        try {
            // Wczytanie danych z pliku dictionary.json
            const response = await fetch('dictionary.json');
            if (!response.ok) {
                throw new Error(`Błąd wczytywania pliku: ${response.statusText}`);
            }
            dictionaryData = await response.json();

            populateBranchFilter(dictionaryData);
            populateAlphabetFilter();
            renderDictionary();
        } catch (error) {
            console.error('Wystąpił błąd podczas wczytywania słownika:', error);
            dictionaryBody.innerHTML = '<tr><td colspan="4">Nie udało się wczytać danych słownika.</td></tr>';
        }
    }

    // Funkcja do wypełniania opcji filtrowania branż
    function populateBranchFilter(data) {
        // Unikalne branże
        const branches = [...new Set(data.map(item => item['Branża']))].sort();

        branches.forEach(branch => {
            const option = document.createElement('option');
            option.value = branch;
            option.textContent = branch;
            filterBranch.appendChild(option);
        });
    }

    // Funkcja do generowania przycisków alfabetu
    function populateAlphabetFilter() {
        // Generowanie alfabetu A-Z (polskie znaki diakrytyczne pominięte dla uproszczenia)
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
        alphabet.unshift('Wszystkie'); // Opcja czyszczenia litery

        alphabet.forEach(letter => {
            const button = document.createElement('button');
            button.classList.add('alphabet-button');
            button.textContent = letter;
            button.setAttribute('data-letter', letter === 'Wszystkie' ? '' : letter);

            button.addEventListener('click', () => {
                const selectedLetter = button.getAttribute('data-letter');

                // Logika przełączania: jeśli kliknięto tę samą literę, wyczyść filtr
                if (currentFilter.letter === selectedLetter && selectedLetter !== '') {
                    currentFilter.letter = '';
                } else if (selectedLetter === '') {
                    currentFilter.letter = '';
                } else {
                    currentFilter.letter = selectedLetter;
                }

                // Aktualizacja wyglądu przycisków
                document.querySelectorAll('.alphabet-button').forEach(btn => btn.classList.remove('active'));
                if (currentFilter.letter) {
                    button.classList.add('active');
                } else {
                    // Aktywacja przycisku "Wszystkie"
                    document.querySelector('.alphabet-button[data-letter=""]').classList.add('active');
                }

                renderDictionary();
            });
            alphabetFilter.appendChild(button);
        });

        // Domyślne zaznaczenie "Wszystkie"
        document.querySelector('.alphabet-button[data-letter=""]').classList.add('active');
    }

    // Funkcja do filtrowania i sortowania danych
    function filterAndSortData(data) {
        let filteredData = [...data]; // Kopia danych

        // 1. Filtrowanie po branży
        if (currentFilter.branch) {
            filteredData = filteredData.filter(item => item['Branża'] === currentFilter.branch);
        }

        // 2. Filtrowanie po literze (zgodnie z wybranym językiem sortowania)
        if (currentFilter.letter) {
            const letter = currentFilter.letter.toLowerCase();
            const languageKey = currentFilter.language;

            filteredData = filteredData.filter(item => {
                // Obsługa przypadków, gdzie pole zawiera wiele słów rozdzielonych przecinkiem (np. id: 21)
                const words = String(item[languageKey]).split(',');
                return words.some(word => word.trim().toLowerCase().startsWith(letter));
            });
        }

        // 3. Sortowanie
        const sortKey = currentFilter.language;
        filteredData.sort((a, b) => {
            const valA = String(a[sortKey]).toLowerCase();
            const valB = String(b[sortKey]).toLowerCase();

            if (valA < valB) return -1;
            if (valA > valB) return 1;
            return 0;
        });

        return filteredData;
    }

    // Funkcja do renderowania słownika w tabeli
    function renderDictionary() {
        const dataToDisplay = filterAndSortData(dictionaryData);
        dictionaryBody.innerHTML = ''; // Wyczyść obecną tabelę

        if (dataToDisplay.length === 0) {
            dictionaryBody.innerHTML = '<tr><td colspan="4">Brak elementów spełniających kryteria filtrowania.</td></tr>';
            return;
        }

        dataToDisplay.forEach(item => {
            const row = dictionaryBody.insertRow();
            row.insertCell().textContent = item['Branża'];
            row.insertCell().textContent = item['Polski'];
            row.insertCell().textContent = item['Angielski'];
            row.insertCell().textContent = item['Hiszpański'];
        });
    }

    // Nasłuchiwanie zmian w filtrach/sortowaniu
    filterBranch.addEventListener('change', (event) => {
        currentFilter.branch = event.target.value;
        renderDictionary();
    });

    sortLanguage.addEventListener('change', (event) => {
        currentFilter.language = event.target.value;
        // Wymuszenie ponownego renderowania po zmianie języka sortowania
        // (Ważne dla poprawnego działania filtra literowego, który zależy od języka)
        renderDictionary();
    });

    // Uruchomienie aplikacji
    loadDictionary();
});