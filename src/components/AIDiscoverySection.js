import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from 'react-native-vector-icons';
import colors from '../../assets/colors/colors';
import AIRecommendationService from '../services/aiRecommendation';

const AIDiscoverySection = ({ opportunities, onOpportunityPress, navigation }) => {
  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    loadAIRecommendations();
  }, [opportunities]);

  const loadAIRecommendations = async () => {
    setLoading(true);
    try {
      const recommendations = await AIRecommendationService.getPersonalizedRecommendations(opportunities);
      setAiRecommendations(recommendations.slice(0, showAll ? recommendations.length : 3));
    } catch (error) {
      console.error('Error loading AI recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpportunityPress = async (opportunity) => {
    // Record user interaction for AI learning
    await AIRecommendationService.recordUserInteraction(opportunity.id || opportunity.name, 'view');
    onOpportunityPress(opportunity);
  };

  const handleSaveOpportunity = async (opportunity) => {
    await AIRecommendationService.recordUserInteraction(opportunity.id || opportunity.name, 'save');
    // You can add save functionality here
  };

  const handleIgnoreOpportunity = async (opportunity) => {
    await AIRecommendationService.recordUserInteraction(opportunity.id || opportunity.name, 'ignore');
    // Remove from recommendations
    setAiRecommendations(prev => prev.filter(opp => opp.id !== opportunity.id));
  };

  const renderOpportunityCard = (opportunity, index) => (
    <TouchableOpacity
      key={opportunity.id || index}
      style={styles.opportunityCard}
      onPress={() => handleOpportunityPress(opportunity)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.aiBadge}>
          <Ionicons name="star" size={12} color={colors.primary} />
          <Text style={styles.aiBadgeText}>AI Recommended</Text>
        </View>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>{Math.round(opportunity.aiScore)}%</Text>
          <Text style={styles.scoreLabel}>Match</Text>
        </View>
      </View>

      <Text style={styles.opportunityTitle} numberOfLines={2}>
        {opportunity.name}
      </Text>

      <View style={styles.opportunityDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={16} color={colors.text} />
          <Text style={styles.detailText} numberOfLines={1}>
            {opportunity.location?.city || opportunity.city || 'Location TBD'}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={16} color={colors.text} />
          <Text style={styles.detailText}>
            {new Date(opportunity.date).toLocaleDateString()}
          </Text>
        </View>

        {opportunity.categories && (
          <View style={styles.categoriesContainer}>
            {Array.isArray(opportunity.categories) 
              ? opportunity.categories.slice(0, 2).map((cat, idx) => (
                  <View key={idx} style={styles.categoryTag}>
                    <Text style={styles.categoryText}>
                      {typeof cat === 'object' ? cat.title || cat.alias : cat}
                    </Text>
                  </View>
                ))
              : (
                  <View style={styles.categoryTag}>
                    <Text style={styles.categoryText}>
                      {typeof opportunity.categories === 'object' 
                        ? opportunity.categories.title || opportunity.categories.alias 
                        : opportunity.categories}
                    </Text>
                  </View>
                )
            }
          </View>
        )}
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleSaveOpportunity(opportunity)}
        >
          <Ionicons name="bookmark-outline" size={18} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleIgnoreOpportunity(opportunity)}
        >
          <Ionicons name="close-outline" size={18} color="#666" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Analyzing opportunities for you...</Text>
      </View>
    );
  }

  if (aiRecommendations.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="star-outline" size={48} color={colors.primary} />
        <Text style={styles.emptyTitle}>No AI Recommendations Yet</Text>
        <Text style={styles.emptyText}>
          Complete your profile and start volunteering to get personalized recommendations!
        </Text>
        <TouchableOpacity
          style={styles.setupProfileButton}
          onPress={() => navigation.navigate('UserInfoScreen')}
        >
          <Text style={styles.setupProfileText}>Set Up Profile</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="star" size={24} color={colors.primary} />
          <Text style={styles.headerTitle}>AI Discovery</Text>
        </View>
        <TouchableOpacity
          style={styles.showAllButton}
          onPress={() => setShowAll(!showAll)}
        >
          <Text style={styles.showAllText}>
            {showAll ? 'Show Less' : `Show All (${aiRecommendations.length})`}
          </Text>
          <Ionicons 
            name={showAll ? "chevron-up" : "chevron-down"} 
            size={16} 
            color={colors.primary} 
          />
        </TouchableOpacity>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {aiRecommendations.map((opportunity, index) => 
          renderOpportunityCard(opportunity, index)
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
    color: colors.text,
  },
  showAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  showAllText: {
    fontSize: 14,
    color: colors.primary,
    marginRight: 4,
  },
  scrollContainer: {
    paddingHorizontal: 15,
  },
  opportunityCard: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 15,
    marginRight: 15,
    width: 280,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  aiBadgeText: {
    fontSize: 12,
    color: colors.primary,
    marginLeft: 4,
    fontWeight: '600',
  },
  scoreContainer: {
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  scoreLabel: {
    fontSize: 10,
    color: '#666',
  },
  opportunityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 10,
    lineHeight: 20,
  },
  opportunityDetails: {
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 6,
    flex: 1,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  categoryTag: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '500',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  actionButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.text,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 10,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  setupProfileButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  setupProfileText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default AIDiscoverySection; 