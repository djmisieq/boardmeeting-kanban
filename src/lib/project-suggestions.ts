import { CardType } from './types';

// Interfejs dla sugerowanego kamienia milowego
export interface SuggestedMilestone {
  name: string;
  description: string;
  relativeDays: number; // Liczba dni od rozpoczęcia projektu
}

// Interfejs dla szablonu projektu
export interface ProjectTemplate {
  name: string;
  description: string;
  estimatedDuration: number; // w dniach
  suggestedMilestones: SuggestedMilestone[];
  applicableCategories: ('task' | 'problem' | 'idea')[];
  keywords: string[]; // Słowa kluczowe do matchowania z kartami
}

// Szablon dla różnych typów projektów
export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  // Szablon dla projektów typu "Wdrożenie"
  {
    name: 'Wdrożenie',
    description: 'Szablon dla projektów wdrożeniowych nowych funkcjonalności lub systemów',
    estimatedDuration: 30,
    applicableCategories: ['task'],
    keywords: ['wdrożenie', 'implementacja', 'uruchomienie', 'start', 'nowy system', 'deploy'],
    suggestedMilestones: [
      {
        name: 'Analiza wymagań',
        description: 'Zebranie i analiza wymagań od interesariuszy',
        relativeDays: 5
      },
      {
        name: 'Projekt rozwiązania',
        description: 'Stworzenie projektu technicznego i dokumentacji',
        relativeDays: 10
      },
      {
        name: 'Implementacja MVP',
        description: 'Implementacja minimalnej wersji funkcjonalnej',
        relativeDays: 20
      },
      {
        name: 'Testy i poprawki',
        description: 'Przeprowadzenie testów i wprowadzenie poprawek',
        relativeDays: 25
      },
      {
        name: 'Wdrożenie produkcyjne',
        description: 'Finalne wdrożenie na środowisku produkcyjnym',
        relativeDays: 30
      }
    ]
  },
  
  // Szablon dla projektów typu "Rozwiązanie problemu"
  {
    name: 'Rozwiązanie problemu',
    description: 'Szablon dla projektów związanych z analizą i rozwiązaniem problemów',
    estimatedDuration: 14,
    applicableCategories: ['problem'],
    keywords: ['problem', 'błąd', 'awaria', 'naprawa', 'diagnoza', 'fix', 'bug'],
    suggestedMilestones: [
      {
        name: 'Analiza problemu',
        description: 'Identyfikacja i szczegółowa analiza przyczyn problemu',
        relativeDays: 2
      },
      {
        name: 'Opracowanie rozwiązania',
        description: 'Przygotowanie propozycji rozwiązania problemu',
        relativeDays: 5
      },
      {
        name: 'Implementacja rozwiązania',
        description: 'Wdrożenie zaproponowanego rozwiązania',
        relativeDays: 10
      },
      {
        name: 'Weryfikacja skuteczności',
        description: 'Sprawdzenie, czy problem został rozwiązany',
        relativeDays: 12
      },
      {
        name: 'Dokumentacja i wnioski',
        description: 'Przygotowanie dokumentacji i wniosków na przyszłość',
        relativeDays: 14
      }
    ]
  },
  
  // Szablon dla projektów typu "Optymalizacja"
  {
    name: 'Optymalizacja',
    description: 'Szablon dla projektów związanych z optymalizacją procesów lub systemów',
    estimatedDuration: 21,
    applicableCategories: ['idea', 'task'],
    keywords: ['optymalizacja', 'poprawa', 'usprawnienie', 'wydajność', 'szybkość', 'efektywność'],
    suggestedMilestones: [
      {
        name: 'Analiza obecnego stanu',
        description: 'Zebranie metryk i analiza obecnej wydajności',
        relativeDays: 3
      },
      {
        name: 'Identyfikacja obszarów do optymalizacji',
        description: 'Wskazanie kluczowych obszarów z potencjałem optymalizacji',
        relativeDays: 7
      },
      {
        name: 'Propozycja usprawnień',
        description: 'Opracowanie konkretnych propozycji usprawnień',
        relativeDays: 10
      },
      {
        name: 'Implementacja usprawnień',
        description: 'Wdrożenie zaproponowanych zmian',
        relativeDays: 17
      },
      {
        name: 'Pomiar efektów',
        description: 'Analiza porównawcza i pomiar uzyskanych korzyści',
        relativeDays: 21
      }
    ]
  },
  
  // Szablon dla projektów badawczych
  {
    name: 'Projekt badawczy',
    description: 'Szablon dla projektów związanych z badaniem nowych technologii lub koncepcji',
    estimatedDuration: 45,
    applicableCategories: ['idea'],
    keywords: ['badanie', 'analiza', 'sprawdzenie', 'technologia', 'koncepcja', 'research', 'proof of concept', 'poc'],
    suggestedMilestones: [
      {
        name: 'Określenie zakresu badań',
        description: 'Zdefiniowanie celów i zakresu badań',
        relativeDays: 5
      },
      {
        name: 'Przegląd istniejących rozwiązań',
        description: 'Analiza dostępnych rozwiązań i technologii',
        relativeDays: 15
      },
      {
        name: 'Opracowanie koncepcji',
        description: 'Stworzenie koncepcji rozwiązania',
        relativeDays: 25
      },
      {
        name: 'Proof of Concept',
        description: 'Implementacja prototypu potwierdzającego koncepcję',
        relativeDays: 35
      },
      {
        name: 'Raport i wnioski',
        description: 'Przygotowanie raportu z rekomendacjami',
        relativeDays: 45
      }
    ]
  }
];

/**
 * Funkcja analizująca kartę i znajdująca najbardziej odpowiedni szablon projektu
 */
export function findBestTemplateForCard(card: CardType, category: 'task' | 'problem' | 'idea'): ProjectTemplate | null {
  const cardText = `${card.title} ${card.description || ''}`.toLowerCase();
  
  // Funkcja oceniająca dopasowanie szablonu do karty
  const evaluateTemplateMatch = (template: ProjectTemplate): number => {
    // Sprawdzenie kategorii
    if (!template.applicableCategories.includes(category)) {
      return 0;
    }
    
    // Zliczanie pasujących słów kluczowych
    let matchScore = 0;
    for (const keyword of template.keywords) {
      if (cardText.includes(keyword.toLowerCase())) {
        matchScore += 1;
      }
    }
    
    return matchScore;
  };
  
  // Ocena wszystkich szablonów
  const scoredTemplates = PROJECT_TEMPLATES.map(template => ({
    template,
    score: evaluateTemplateMatch(template)
  }));
  
  // Sortowanie po wyniku dopasowania (malejąco)
  scoredTemplates.sort((a, b) => b.score - a.score);
  
  // Jeśli najlepszy szablon ma wynik > 0, to go zwracamy
  if (scoredTemplates.length > 0 && scoredTemplates[0].score > 0) {
    return scoredTemplates[0].template;
  }
  
  // Jeśli nie znaleziono dopasowania, zwróć domyślny szablon dla kategorii
  const defaultTemplate = PROJECT_TEMPLATES.find(t => 
    t.applicableCategories.includes(category) && 
    (category === 'task' ? t.name === 'Wdrożenie' : 
     category === 'problem' ? t.name === 'Rozwiązanie problemu' : 
     t.name === 'Projekt badawczy')
  );
  
  return defaultTemplate || null;
}

/**
 * Funkcja generująca sugestie kamieni milowych dla karty
 */
export function getSuggestedMilestonesForCard(
  card: CardType, 
  category: 'task' | 'problem' | 'idea',
  startDate: string
): { milestones: SuggestedMilestone[], estimatedDuration: number } {
  const template = findBestTemplateForCard(card, category);
  
  if (!template) {
    return { 
      milestones: [],
      estimatedDuration: 0
    };
  }
  
  // Konwersja dat względnych na bezwzględne
  const startDateObj = new Date(startDate);
  
  return {
    milestones: template.suggestedMilestones,
    estimatedDuration: template.estimatedDuration
  };
}

/**
 * Funkcja generująca sugerowaną datę zakończenia projektu
 */
export function getSuggestedEndDate(startDate: string, category: 'task' | 'problem' | 'idea'): string {
  // Domyślne długości projektów w dniach według kategorii
  const defaultDurations = {
    task: 30,
    problem: 14,
    idea: 45
  };
  
  const startDateObj = new Date(startDate);
  const endDateObj = new Date(startDateObj);
  endDateObj.setDate(startDateObj.getDate() + defaultDurations[category]);
  
  return endDateObj.toISOString().split('T')[0];
}

/**
 * Funkcja generująca sugerowane tagi na podstawie karty
 */
export function getSuggestedTags(card: CardType, category: 'task' | 'problem' | 'idea'): string[] {
  const suggestedTags: string[] = [category]; // Zawsze dodajemy kategorię jako tag
  
  // Dodanie tagów na podstawie tekstu karty
  const cardText = `${card.title} ${card.description || ''}`.toLowerCase();
  
  // Mapowanie słów kluczowych na tagi
  const keywordToTagMap: Record<string, string> = {
    'wdrożenie': 'wdrożenie',
    'implementacja': 'wdrożenie',
    'optymalizacja': 'optymalizacja',
    'poprawa': 'optymalizacja',
    'usprawnienie': 'optymalizacja',
    'problem': 'naprawa',
    'błąd': 'naprawa',
    'awaria': 'naprawa',
    'naprawa': 'naprawa',
    'analiza': 'analiza',
    'badanie': 'badanie',
    'research': 'badanie',
    'concept': 'proof of concept',
    'poc': 'proof of concept'
  };
  
  // Sprawdzenie i dodanie tagów
  for (const [keyword, tag] of Object.entries(keywordToTagMap)) {
    if (cardText.includes(keyword) && !suggestedTags.includes(tag)) {
      suggestedTags.push(tag);
    }
  }
  
  // Dodanie priorytetów jako tagi
  if (card.priority) {
    suggestedTags.push(`priorytet:${card.priority}`);
  }
  
  return suggestedTags;
}
