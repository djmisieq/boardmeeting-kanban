# Integracja między spotkaniami, tablicami Kanban i projektami

## Wprowadzenie

Dokument ten opisuje architekturę i mechanizmy integracji między trzema kluczowymi komponentami aplikacji BoardMeeting Kanban:
- Spotkaniami
- Tablicami Kanban
- Projektami

System zapewnia kompleksowe rozwiązanie do zarządzania spotkaniami, zadaniami i projektami w jednym spójnym ekosystemie.

## Koncepcja integracji

### Schemat powiązań

```
+----------------+       +----------------+       +----------------+
|                |       |                |       |                |
|   Spotkania    | <---> |    Kanban     | <---> |    Projekty    |
|                |       |                |       |                |
+----------------+       +----------------+       +----------------+
       ^                        ^                        ^
       |                        |                        |
       v                        v                        v
+-------------------------------------------------------+
|                                                       |
|              Wspólny widok zintegrowany               |
|                                                       |
+-------------------------------------------------------+
```

### Przepływ danych

1. **Od spotkania do Kanban**:
   - Wyniki spotkań (zadania, problemy, pomysły) są automatycznie tworzone jako karty na odpowiednich tablicach Kanban
   - Zmiany statusu spotkania mogą wpływać na status kart (np. zamknięcie spotkania może oznaczać zakończenie powiązanych zadań)
   - Karty na tablicach Kanban zawierają odznaki wskazujące, z którego spotkania pochodzą

2. **Od Kanban do projektu**:
   - Karty Kanban mogą być przekształcane w projekty lub dołączane do istniejących projektów
   - Status karty wpływa na status i postęp projektu
   - Projekty agregują karty z różnych tablic i działów

3. **Od projektu do Kanban**:
   - Zmiany w statusie projektu mogą wpływać na status kart Kanban
   - Karty powiązane z projektem mają specjalne oznaczenia wizualne
   - Zadania z projektów są widoczne na tablicach Kanban

4. **Od Kanban do spotkań**:
   - Zmiany w kartach Kanban aktualizują odpowiadające im wyniki w spotkaniach
   - Status karty jest synchronizowany ze statusem wyniku spotkania

## Architektura integracji

### Składniki systemu

1. **Magazyny stanu (Stores)**:
   - `use-meetings-store.ts` - Zarządza spotkaniami i ich wynikami
   - `use-kanban-store.ts` - Zarządza tablicami Kanban, kolumnami i kartami
   - `use-projects-store.ts` - Zarządza projektami i ich zadaniami

2. **Komponenty wizualizacji powiązań**:
   - `MeetingBadge` - Wyświetla odznakę spotkania na kartach Kanban
   - `ProjectBadge` - Wyświetla odznakę projektu na kartach Kanban
   - `EnhanceProjectConnections` - Dodaje obramowanie i inne wizualne elementy dla kart powiązanych z projektami

3. **Mechanizmy synchronizacji**:
   - `kanban-project-sync.ts` - Zawiera funkcje synchronizujące status między kartami, projektami i spotkaniami
   - `status-mapping.ts` - Definiuje mapowanie statusów między różnymi komponentami

4. **Komponenty integracyjne**:
   - `IntegratedBoard` - Zapewnia widok zawierający zarówno tablice Kanban, jak i projekty
   - `MeetingOutcomesView` - Wyświetla wyniki spotkania z informacją o ich statusie na tablicach Kanban
   - `MeetingOutcomeForm` - Formularz dodawania wyników spotkania, które stają się kartami Kanban

## Kluczowe funkcje synchronizacji

### 1. syncCardStatusWithProject

Funkcja ta synchronizuje status karty Kanban z projektem, np. gdy karta jest przesuwana do kolumny "Zakończone", projekt może również zostać oznaczony jako zakończony.

```typescript
export const syncCardStatusWithProject = (
  cardId: string,
  boardId: string,
  columnId: string
): { success: boolean; message: string } => {
  // Implementacja...
};
```

### 2. syncProjectStatusWithCards

Funkcja ta synchronizuje status projektu z powiązanymi kartami Kanban, np. gdy projekt zostaje oznaczony jako zakończony, wszystkie powiązane karty mogą zostać przeniesione do odpowiednich kolumn.

```typescript
export const syncProjectStatusWithCards = (
  projectId: string,
  status: ProjectStatus
): { success: boolean; message: string } => {
  // Implementacja...
};
```

### 3. syncKanbanCardWithMeeting

Funkcja ta synchronizuje zmiany w karcie Kanban z wynikami spotkania, z którego pochodzą.

```typescript
export const syncKanbanCardWithMeeting = (
  cardId: string,
  boardId: string,
  columnId: string
): { success: boolean; message: string } => {
  // Implementacja...
};
```

### 4. addKanbanCardToMeeting

Funkcja ta dodaje nowo utworzoną kartę Kanban do wyników spotkania.

```typescript
export const addKanbanCardToMeeting = (
  card: CardType,
  meetingId: string,
  agendaItemId?: string
): { success: boolean; message: string } => {
  // Implementacja...
};
```

## Przypadki użycia

### 1. Dodawanie wyniku spotkania

1. Użytkownik tworzy nowy wynik spotkania (zadanie, problem, pomysł)
2. System:
   - Tworzy kartę na odpowiedniej tablicy Kanban
   - Dodaje odznakę spotkania do karty
   - Zapisuje referencję do karty w wynikach spotkania

### 2. Aktualizacja statusu karty Kanban

1. Użytkownik przesuwa kartę do innej kolumny na tablicy Kanban
2. System:
   - Aktualizuje status karty
   - Jeśli karta jest powiązana z projektem, aktualizuje postęp projektu
   - Jeśli karta pochodzi ze spotkania, aktualizuje status wyniku w spotkaniu

### 3. Przekształcanie karty w projekt

1. Użytkownik wybiera opcję przekształcenia karty w projekt
2. System:
   - Tworzy nowy projekt na podstawie karty
   - Dodaje kartę jako pierwsze zadanie projektu
   - Dodaje odznakę projektu do karty
   - Synchronizuje status projektu z kartą

### 4. Zakończenie spotkania

1. Użytkownik oznacza spotkanie jako zakończone
2. System:
   - Aktualizuje status spotkania
   - Opcjonalnie może zaktualizować status kart Kanban, które nie zostały jeszcze zakończone

## Wizualizacja powiązań

### 1. Oznaczenia na kartach Kanban

- Karty powiązane z projektami mają:
  - Kolorowe obramowanie zależne od statusu projektu
  - Odznakę projektu w prawym górnym rogu
  - Opcję przejścia do projektu w menu
  
- Karty pochodzące ze spotkań mają:
  - Odznakę spotkania
  - Odnośnik do spotkania w menu
  - Tooltip z informacjami o spotkaniu

### 2. Oznaczenia w widokach projektów i spotkań

- Projekty pokazują:
  - Listę powiązanych kart Kanban ze statusami
  - Postęp obliczony na podstawie statusów kart

- Spotkania pokazują:
  - Listy wyników z ich aktualnym statusem z tablic Kanban
  - Możliwość filtrowania wyników według statusu, typu itp.

## Uwagi implementacyjne

### Wydajność

- Synchronizacja jest przeprowadzana tylko dla elementów, które faktycznie się zmieniły
- Zastosowano buforowanie dla poprawy wydajności w przypadku dużej liczby kart i projektów
- Używane są selektory Zustand do efektywnego pobierania danych

### Skalowalność

- Architektura pozwala na łatwe dodawanie nowych typów powiązań
- System może być rozszerzony o dodatkowe funkcje, takie jak raportowanie lub automatyzacje
- Struktura komponentów zapewnia możliwość ponownego wykorzystania w różnych kontekstach

### Baza danych

- Dane są przechowywane lokalnie z wykorzystaniem mechanizmu persist z Zustand
- W przyszłej wersji planowane jest dodanie synchronizacji z bazą danych na serwerze
- Struktura danych jest zaprojektowana z myślą o łatwej migracji do rozwiązania chmurowego

## Problemy i wyzwania

### Potencjalne konflikty

1. **Konflikty synchronizacji**:
   - Może wystąpić sytuacja, gdy karta jest powiązana z projektem i jednocześnie pochodzi ze spotkania
   - Rozwiązanie: Określona hierarchia aktualizacji - spotkania mają pierwszeństwo przed projektami

2. **Cykle aktualizacji**:
   - Potencjalnie mogą wystąpić nieskończone cykle aktualizacji między komponentami
   - Rozwiązanie: Flagi blokujące wielokrotne wywołania tych samych aktualizacji

### Ograniczenia

1. **Brak współdzielenia w czasie rzeczywistym**:
   - Obecna implementacja nie obsługuje synchronizacji w czasie rzeczywistym między różnymi użytkownikami
   - Planowane rozwiązanie: Dodanie websocketów do synchronizacji w czasie rzeczywistym

2. **Ograniczona historia zmian**:
   - System nie przechowuje pełnej historii zmian dla kart i projektów
   - Planowane rozwiązanie: Implementacja systemu śledzenia zmian

## Planowane rozszerzenia

### 1. Powiadomienia

- Dodanie systemu powiadomień informującego o zmianach w powiązanych elementach
- Powiadomienia mogą być wysyłane przez e-mail, jako powiadomienia w aplikacji lub przez integrację z narzędziami komunikacyjnymi

### 2. Zaawansowane raportowanie

- Tworzenie raportów z wynikami spotkań i ich wpływem na projekty
- Śledzenie efektywności realizacji zadań wynikających ze spotkań

### 3. Automatyzacje

- Automatyczne aktualizacje statusów na podstawie warunków
- Automatyczne przypisywanie zadań
- Automatyczne przypomnienia o zbliżających się terminach

### 4. Integracje z zewnętrznymi systemami

- Integracja z kalendarzami (Google Calendar, Microsoft Outlook)
- Integracja z narzędziami komunikacyjnymi (Slack, Microsoft Teams)
- Integracja z innymi systemami zarządzania projektami

## Wdrażanie integracji

### Konfiguracja

Aby uruchomić pełną integrację, należy upewnić się, że:

1. Istnieją odpowiednie tablice Kanban dla wszystkich typów wyników (zadania, problemy, pomysły)
2. System projektów jest poprawnie skonfigurowany
3. Użytkownicy mają uprawnienia do wszystkich komponentów systemu

### Testowanie

System integracji powinien być testowany pod kątem:

1. Poprawności synchronizacji między komponentami
2. Wydajności przy dużej liczbie powiązanych elementów
3. Odporności na błędy i konflikty

### Szkolenie użytkowników

Użytkownicy powinni zostać przeszkoleni w zakresie:

1. Tworzenia wyników spotkań i ich powiązań z tablicami Kanban
2. Przekształcania kart Kanban w projekty
3. Korzystania z wizualizacji powiązań
4. Rozwiązywania potencjalnych konfliktów

## Podsumowanie

Integracja między spotkaniami, tablicami Kanban i projektami w aplikacji BoardMeeting Kanban zapewnia kompleksowe rozwiązanie do zarządzania pracą zespołu. Dzięki dwukierunkowej synchronizacji i wizualizacji powiązań, użytkownicy mogą śledzić postęp zadań od ich powstania podczas spotkań, przez zarządzanie na tablicach Kanban, aż po realizację w ramach projektów.

System integracji jest elastyczny i skalowalny, co pozwala na jego rozbudowę i dostosowanie do zmieniających się potrzeb organizacji.
