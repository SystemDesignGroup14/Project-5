// FetchModel.js
function sendRequest(url) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(xhr);
      } else {
        reject({
          status: xhr.status,
          statusText: xhr.statusText
        });
      }
    };
    xhr.onerror = () => reject(new Error('Network error'));
    xhr.send();
  });
}

function parseResponse(xhr) {
  try {
    const data = JSON.parse(xhr.responseText);
    return data; // Return the parsed JSON data
  } catch (error) {
    throw new Error('Error parsing JSON');
  }
}

function FetchModel(url) {
  return sendRequest(url)
    .then(parseResponse)
    .then(data => ({ data })) // Wrap the data in an object
    .catch(error => {
      throw {
        status: error.status || 500,
        statusText: error.statusText || 'An error occurred',
      };
    });
}

// Export the FetchModel function
export default FetchModel;
