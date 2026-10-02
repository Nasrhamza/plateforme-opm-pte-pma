module.exports.formatDate = (dateString) => {
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        hour: 'numeric', 
        minute: 'numeric', 
        hour12: true // Use 12-hour format
    };
    const date = new Date(dateString);
    return date.toLocaleString('en-US', options);
  };


