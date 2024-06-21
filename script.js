document.addEventListener('DOMContentLoaded', () => {
  const links = document.querySelectorAll('.auth-links a');

  links.forEach(link => {
    if (link.href === window.location.href) {
      link.classList.add('active');
    }
  });

  const allStar = document.querySelectorAll('.rating .star');
  const ratingValue = document.querySelector('.rating input');
  const form = document.getElementById('review-form');
  const opinion = document.querySelector('textarea');
  const reviewsList = document.querySelector('.reviews-list');
  const errorMessage = document.getElementById('error-message');

  // Generate or retrieve a unique user ID
  let userId = localStorage.getItem('userId');
  if (!userId) {
    userId = 'user_' + Date.now();
    localStorage.setItem('userId', userId);
  }

  allStar.forEach((item, idx) => {
    item.addEventListener('click', function () {
      let click = 0;
      ratingValue.value = idx + 1;

      allStar.forEach(i => {
        i.classList.replace('bxs-star', 'bx-star');
        i.classList.remove('active');
      });
      for (let i = 0; i < allStar.length; i++) {
        if (i <= idx) {
          allStar[i].classList.replace('bx-star', 'bxs-star');
          allStar[i].classList.add('active');
        } else {
          allStar[i].style.setProperty('--i', click);
          click++;
        }
      }
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const lastReviewTime = parseInt(localStorage.getItem('lastReviewTime_' + userId)) || 0;
    const currentTime = Date.now();
    const timeDifference = (currentTime - lastReviewTime) / 1000 / 60; // time difference in minutes

    if (timeDifference < 2) {
      errorMessage.textContent = 'You can only post one review every 2 minutes.';
      return;
    }

    if (ratingValue.value && opinion.value.trim()) {
      const review = {
        id: currentTime,
        rating: ratingValue.value,
        opinion: opinion.value,
        userId: userId
      };

      // Save the review to local storage
      saveReview(review);

      // Update the last review time for the user
      localStorage.setItem('lastReviewTime_' + userId, currentTime);

      // Add the review to the page
      addReviewToPage(review);

      // Clear form fields
      ratingValue.value = '';
      opinion.value = '';
      allStar.forEach(i => {
        i.classList.replace('bxs-star', 'bx-star');
        i.classList.remove('active');
      });

      // Clear the error message
      errorMessage.textContent = '';
    }
  });

  const storedReviews = JSON.parse(localStorage.getItem('reviews')) || [];
  storedReviews.forEach(addReviewToPage);

  function saveReview(review) {
    const reviews = JSON.parse(localStorage.getItem('reviews')) || [];
    reviews.push(review);
    localStorage.setItem('reviews', JSON.stringify(reviews));
  }

  function deleteReview(id) {
    let reviews = JSON.parse(localStorage.getItem('reviews')) || [];
    reviews = reviews.filter(review => review.id !== id);
    localStorage.setItem('reviews', JSON.stringify(reviews));
    document.querySelector(`.review-container[data-id="${id}"]`).remove();
  }

  function addReviewToPage(review) {
    const reviewContainer = document.createElement('div');
    reviewContainer.classList.add('review-container');
    reviewContainer.setAttribute('data-id', review.id);

    const stars = document.createElement('div');
    stars.classList.add('review-stars');
    for (let i = 0; i < review.rating; i++) {
      const star = document.createElement('i');
      star.classList.add('bx', 'bxs-star');
      stars.appendChild(star);
    }

    const user = document.createElement('p');
    user.classList.add('review-user');
    const reviewIndex = (JSON.parse(localStorage.getItem('reviews')) || []).filter(r => r.userId === review.userId).length;
    user.textContent = `Anonymous #${reviewIndex}`;

    const reviewText = document.createElement('p');
    reviewText.classList.add('review-text');
    reviewText.textContent = review.opinion;

    if (review.userId === userId) {
      const deleteIcon = document.createElement('i');
      deleteIcon.classList.add('bx', 'bx-trash', 'delete-icon');
      deleteIcon.addEventListener('click', () => deleteReview(review.id));
      reviewContainer.appendChild(deleteIcon);
    }

    reviewContainer.appendChild(stars);
    reviewContainer.appendChild(user);
    reviewContainer.appendChild(reviewText);

    reviewsList.appendChild(reviewContainer);
  }
});
