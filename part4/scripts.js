function getCookie(name) {
    const cookies = document.cookie.split(';');

    for (let cookie of cookies) {
        cookie = cookie.trim();

        if (cookie.startsWith(name + '=')) {
            return cookie.substring(name.length + 1);
        }
    }

    return null;
}

async function fetchPlaces(token) {
    try {
        const headers = {};

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(
            'http://127.0.0.1:5000/api/v1/places/',
            {
                method: 'GET',
                headers: headers
            }
        );

        if (!response.ok) {
            throw new Error('Failed to fetch places');
        }

        const places = await response.json();
        displayPlaces(places);
    } catch (error) {
        console.error(error);
    }
}

function displayPlaces(places) {
    const placesList = document.getElementById('places-list');

    if (!placesList) {
        return;
    }

    placesList.innerHTML = '';

    places.forEach((place) => {
        const placeCard = document.createElement('article');

        placeCard.className = 'place-card';
        placeCard.dataset.price = place.price;

        placeCard.innerHTML = `
            <h2>${place.title}</h2>
            <p>${place.description || ''}</p>
            <p>Price per night: $${place.price}</p>
            <a href="place.html?id=${place.id}" class="details-button">
                View Details
            </a>
        `;

        placesList.appendChild(placeCard);
    });
}

function getPlaceIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

async function fetchPlaceDetails(token, placeId) {
    try {
        const headers = {};

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(
            `http://127.0.0.1:5000/api/v1/places/${placeId}`,
            {
                method: 'GET',
                headers: headers
            }
        );

        if (!response.ok) {
            throw new Error('Failed to fetch place details');
        }

        const place = await response.json();
        displayPlaceDetails(place);

    } catch (error) {
        console.error(error);
    }
}

function displayPlaceDetails(place) {
    const placeDetails = document.getElementById('place-details');

    if (!placeDetails) {
        return;
    }

    const amenities = place.amenities && place.amenities.length > 0
        ? place.amenities.map((amenity) => amenity.name).join(', ')
        : 'No amenities available';

    const ownerName = place.owner
        ? `${place.owner.first_name} ${place.owner.last_name}`
        : 'Unknown';

    placeDetails.innerHTML = `
        <h1>${place.title}</h1>

        <div class="place-info">
            <p><strong>Host:</strong> ${ownerName}</p>
            <p><strong>Price per night:</strong> $${place.price}</p>
            <p><strong>Description:</strong> ${place.description || ''}</p>
            <p><strong>Amenities:</strong> ${amenities}</p>
        </div>
    `;
}

async function fetchReviews(placeId) {
    try {
        const response = await fetch(
            `http://127.0.0.1:5000/api/v1/places/${placeId}/reviews`,
            {
                method: 'GET'
            }
        );

        if (!response.ok) {
            throw new Error('Failed to fetch reviews');
        }

        const reviews = await response.json();
        displayReviews(reviews);

    } catch (error) {
        console.error(error);
    }
}

function displayReviews(reviews) {
    const reviewsList = document.getElementById('reviews-list');

    if (!reviewsList) {
        return;
    }

    reviewsList.innerHTML = '';

    if (reviews.length === 0) {
        reviewsList.innerHTML = '<p>No reviews yet.</p>';
        return;
    }

    reviews.forEach((review) => {
        const reviewCard = document.createElement('div');

        reviewCard.className = 'review-card';

        reviewCard.innerHTML = `
            <p>${review.text}</p>
            <p><strong>Rating:</strong> ${review.rating}/5</p>
        `;

        reviewsList.appendChild(reviewCard);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');

    const token = getCookie('token');
const loginLink = document.getElementById('login-link');

if (loginLink) {
    if (token) {
        loginLink.style.display = 'none';
    } else {
        loginLink.style.display = 'block';
    }
}

if (document.getElementById('places-list')) {
    fetchPlaces(token);
}

const priceFilter = document.getElementById('price-filter');

if (priceFilter) {
    priceFilter.addEventListener('change', (event) => {
        const selectedPrice = event.target.value;
        const placeCards = document.querySelectorAll('.place-card');

        placeCards.forEach((card) => {
            const price = parseFloat(card.dataset.price);

            if (selectedPrice === 'all' || price <= parseFloat(selectedPrice)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });
}
const placeDetails = document.getElementById('place-details');

if (placeDetails) {
    const placeId = getPlaceIdFromURL();
    const addReviewSection = document.getElementById('add-review');

    if (addReviewSection) {
        if (token) {
            addReviewSection.style.display = 'block';
        } else {
            addReviewSection.style.display = 'none';
        }
    }

    if (placeId) {
        fetchPlaceDetails(token, placeId);
         fetchReviews(placeId);
    }
}

    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const errorMessage = document.getElementById('login-error');

            try {
                const response = await fetch(
                    'http://127.0.0.1:5000/api/v1/auth/login',
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            email: email,
                            password: password
                        })
                    }
                );

                if (response.ok) {
                    const data = await response.json();

                    document.cookie = `token=${data.access_token}; path=/`;

                    window.location.href = 'index.html';
                } else {
                    errorMessage.textContent = 'Invalid email or password.';
                }
            } catch (error) {
                errorMessage.textContent = 'Unable to connect to the server.';
            }
        });
    }
});