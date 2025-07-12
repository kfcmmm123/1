import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AI recommendation service
// In production, this would connect to a real AI service like OpenAI, Google AI, or your own ML model
class AIRecommendationService {
  constructor() {
    this.userPreferences = null;
    this.userHistory = [];
  }

  // Load user preferences and history
  async loadUserData() {
    try {
      const userData = await AsyncStorage.getItem('@user_data');
      const userHistory = await AsyncStorage.getItem('@user_volunteer_history');
      
      this.userPreferences = userData ? JSON.parse(userData) : null;
      this.userHistory = userHistory ? JSON.parse(userHistory) : [];
    } catch (error) {
      console.error('Error loading user data for AI:', error);
    }
  }

  // Generate personalized recommendations
  async getPersonalizedRecommendations(allOpportunities, filters = {}) {
    await this.loadUserData();
    
    if (!allOpportunities || allOpportunities.length === 0) {
      return [];
    }

    // Score each opportunity based on user preferences
    const scoredOpportunities = allOpportunities.map(opportunity => {
      let score = 0;
      
      // Score based on user interests
      if (this.userPreferences?.interests) {
        const userInterests = this.userPreferences.interests;
        const opportunityCategories = this.getCategoriesText(opportunity.categories);
        
        userInterests.forEach(interest => {
          if (opportunityCategories.toLowerCase().includes(interest.toLowerCase())) {
            score += 10;
          }
        });
      }

      // Score based on location preference
      if (this.userPreferences?.city && opportunity.location?.city) {
        if (this.userPreferences.city.toLowerCase() === opportunity.location.city.toLowerCase()) {
          score += 15;
        }
      }

      // Score based on past volunteer history
      if (this.userHistory.length > 0) {
        const similarPastEvents = this.userHistory.filter(history => 
          this.getCategoriesText(history.categories).toLowerCase() === 
          this.getCategoriesText(opportunity.categories).toLowerCase()
        );
        score += similarPastEvents.length * 5;
      }

      // Score based on time availability
      if (this.userPreferences?.availability) {
        const eventDate = new Date(opportunity.date);
        const now = new Date();
        const daysUntilEvent = Math.ceil((eventDate - now) / (1000 * 60 * 60 * 24));
        
        if (daysUntilEvent >= 1 && daysUntilEvent <= 30) {
          score += 8;
        }
      }

      // Score based on organization rating (if available)
      if (opportunity.rating) {
        score += opportunity.rating * 2;
      }

      // Apply filters
      if (filters.city && opportunity.location?.city !== filters.city) {
        score = 0; // Exclude if doesn't match city filter
      }

      if (filters.categories && filters.categories.length > 0) {
        const opportunityCategories = this.getCategoriesText(opportunity.categories);
        const hasMatchingCategory = filters.categories.some(cat => 
          opportunityCategories.toLowerCase().includes(cat.toLowerCase())
        );
        if (!hasMatchingCategory) {
          score = 0; // Exclude if doesn't match category filter
        }
      }

      return {
        ...opportunity,
        aiScore: score,
        isRecommended: score > 15
      };
    });

    // Sort by AI score (highest first) and filter out zero scores
    const recommendedOpportunities = scoredOpportunities
      .filter(opp => opp.aiScore > 0)
      .sort((a, b) => b.aiScore - a.aiScore);

    return recommendedOpportunities;
  }

  // Get categories text from opportunity
  getCategoriesText(categories) {
    if (typeof categories === 'string') return categories;
    if (Array.isArray(categories)) {
      return categories.map(cat => 
        typeof cat === 'object' ? cat.title || cat.alias : cat
      ).join(', ');
    }
    if (typeof categories === 'object') {
      return categories.title || categories.alias || '';
    }
    return '';
  }

  // Update user preferences for better recommendations
  async updateUserPreferences(newPreferences) {
    try {
      const currentData = await AsyncStorage.getItem('@user_data');
      const userData = currentData ? JSON.parse(currentData) : {};
      
      const updatedData = {
        ...userData,
        ...newPreferences
      };
      
      await AsyncStorage.setItem('@user_data', JSON.stringify(updatedData));
      this.userPreferences = updatedData;
    } catch (error) {
      console.error('Error updating user preferences:', error);
    }
  }

  // Record user interaction for learning
  async recordUserInteraction(opportunityId, interactionType) {
    try {
      const currentHistory = await AsyncStorage.getItem('@user_volunteer_history');
      const history = currentHistory ? JSON.parse(currentHistory) : [];
      
      const interaction = {
        opportunityId,
        interactionType, // 'view', 'apply', 'save', 'ignore'
        timestamp: new Date().toISOString()
      };
      
      history.push(interaction);
      await AsyncStorage.setItem('@user_volunteer_history', JSON.stringify(history));
      this.userHistory = history;
    } catch (error) {
      console.error('Error recording user interaction:', error);
    }
  }
}

export default new AIRecommendationService(); 