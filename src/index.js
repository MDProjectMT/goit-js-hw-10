import axios from 'axios';
import SlimSelect from 'slim-select';
import Notiflix from 'notiflix';
import 'notiflix/dist/notiflix-3.2.7.min.css';

axios.defaults.headers.common['x-api-key'] =
  'live_te856qxowy8cxxpyh150aUBOFpEQuBhHc37ZGimffNVZI9krztEHjqua5vVy91QM';

export async function fetchBreeds() {
  try {
    document.querySelector('.loader').removeAttribute('style');

    const response = await axios.get('https://api.thecatapi.com/v1/breeds');
    const breeds = response.data.map(breed => ({
      id: breed.id,
      name: breed.name,
    }));
    document.querySelector('.loader').style.display = 'none';
    return breeds;
  } catch (error) {
    document.querySelector('.loader').style.display = 'none';
    Notiflix.Notify.failure(
      'Oops! Something went wrong! Try reloading the page!'
    );
    throw error;
  }
}

export async function populateBreedSelect() {
  try {
    const breeds = await fetchBreeds();
    const select = document.querySelector('.breed-select');
    select.innerHTML = '';
    breeds.forEach(breed => {
      const option = document.createElement('option');
      option.value = breed.id;
      option.textContent = breed.name;
      select.appendChild(option);
    });
    new SlimSelect({
      select: '.breed-select',
    });
  } catch (error) {
    Notiflix.Notify.failure(
      'Oops! Something went wrong! Try reloading the page!'
    );
  }
}

export async function fetchCatByBreed(breedId) {
  try {
    document.querySelector('.loader').removeAttribute('style');

    const params = {
      breed_ids: breedId, // Ustawienie parametru zapytania
      limit: 1, // Możemy ograniczyć do jednego wyniku
    };
    const response = await axios.get(
      'https://api.thecatapi.com/v1/images/search',
      { params }
    );
    if (response.data.length > 0) {
      const catInfo = response.data[0];
      document.querySelector('.loader').style.display = 'none';
      return {
        imageUrl: catInfo.url,
        name: catInfo.breeds[0].name,
        description: catInfo.breeds[0].description,
        temperament: catInfo.breeds[0].temperament,
      };
    }
    return null;
  } catch (error) {
    document.querySelector('.loader').style.display = 'none';
    Notiflix.Notify.failure(
      'Oops! Something went wrong! Try reloading the page!'
    );
    throw error;
  }
}

export async function updateCatInfo(breedId) {
  const catInfo = await fetchCatByBreed(breedId);
  const catInfoDiv = document.querySelector('.cat-info');
  if (catInfo) {
    catInfoDiv.innerHTML = `
            <img src="${catInfo.imageUrl}" alt="Obraz kota rasy ${catInfo.name}" style="width: 250px;">
            <div>
                <h1>${catInfo.name}</h1>
                <p>${catInfo.description}</p>
                <p><strong>Temperament:</strong> ${catInfo.temperament}</p>
            </div>
        `;
  } else {
    catInfoDiv.innerHTML = '<p>Nie znaleziono informacji o wybranej rasie.</p>';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  populateBreedSelect();

  document
    .querySelector('.breed-select')
    .addEventListener('change', function () {
      const breedId = this.value;
      updateCatInfo(breedId);
    });
});
