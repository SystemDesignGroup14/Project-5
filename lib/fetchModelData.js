function FetchModel(url) {
  return fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      return response.json();
    })
    .then(data => ({ data }))
    .catch(error => {
      throw { status: error.status || 500, statusText: error.message || 'An error occurred' };
    });
}

// Export the FetchModel function
export default FetchModel;
