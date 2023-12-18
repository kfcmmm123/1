
import { useEffect, useState } from 'react';
import yelp from '../api/yelp';

export default () => {
  const [results, setResults] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  const searchApi = async searchTerm => {
    try {
        const response = await yelp.get('/search', {
            params: {
                location: 'canada',
                term: searchTerm,
                categories: 'Volunteer',
                sort_by: 'best_match',
                limit: 20
            }
        });
        setResults(response.data.businesses);
    } catch (error) {
        console.error('Error during search:', error);
        setErrorMessage('Something went wrong...');
    }
  };

  return [searchApi, results, errorMessage];
};