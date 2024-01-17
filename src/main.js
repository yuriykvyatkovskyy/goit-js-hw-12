import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import axios from 'axios';

const form = document.querySelector('.form');
const input = document.querySelector('input');
const galleryBox = document.querySelector('.gallery-box');
const gallery = document.querySelector('.gallery');
const loader = document.querySelector('.loader');
const loaderBottom = document.querySelector('.loader-bottom');
const loadingBtn = document.querySelector('.loading-btn');

let page = 1;
let q = '';
let perPage = 40;

const lightbox = new SimpleLightbox('.gallery a', {
    nav: true,
    captionDelay: 250,
    captionsData: 'alt',
    close: true,
    enableKeyboard: true,
    docClose: true,
});

// Пошук за формою
form.addEventListener('submit', onSubmit);
loadingBtn.addEventListener('click', loadMore);

async function onSubmit(event) {
  event.preventDefault();
  page = 1;
  loader.style.display = 'none';
  q = event.target.elements.search.value.trim();

  if (!q) {
    gallery.innerHTML = '';
    loadingBtn.style.display = 'none';
    return iziToast.info({
      position: 'topRight',
      message: 'Error enter any symbols',
    });
  }
  try {
    loader.style.display = 'block';
    const {
      data: { hits, total },
    } = await searchImg(q, page);

    if (hits.length > 0) {
      loader.style.display = 'none';
      gallery.innerHTML = renderImg(hits);
      lightbox.refresh();
      iziToast.success({
        position: 'topRight',
        message: `We found ${total} photos`,
      });
      loadingBtn.style.display = 'block';
    } else {
      gallery.innerHTML = '';
      iziToast.error({
        position: 'topRight',
        message:
          'Sorry, there are no images matching your search query. Please try again!',
      });
    }

    if (total <= perPage) {
      loadingBtn.style.display = 'none';
    }
  } catch (error) {
    console.log('Error');
  } finally {
    loader.style.display = 'none';
    form.reset();
  }
}

// Опції для пошуку
function searchImg(q, page) {
  axios.defaults.baseURL = 'https://pixabay.com/api/';

  return axios.get('', {
    params: {
      key: '41752354-d1ac8bee07efd7a3da621dba9',
      q,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: true,
      page,
      per_page: 40,
    },
  });
}

// Галерея
function renderImg(hits = []) {
  return hits.reduce((html, hit) => {
    return (
      html +
      `<li class="gallery-item">
        <a href=${hit.largeImageURL}>
          <img class="gallery-img" src =${hit.webformatURL} alt=${hit.tags}/>
        </a>
        <div class="gallery-text-box">
          <p>Likes: <span class="text-value">${hit.likes}</span></p>
          <p>views: <span class="text-value">${hit.views}</span></p>
          <p>comments: <span class="text-value">${hit.comments}</span></p>
          <p>downloads: <span class="text-value">${hit.downloads}</span></p>
      </div>
      </li>`
    );
  }, '');
}

// Кнопка 'Load more' та пошук за нею
async function loadMore(event) {
  event.preventDefault();
  loaderBottom.style.display = 'block';
  loadingBtn.style.display = 'none';
  try {
    page += 1;

    const {
      data: { hits, totalHits },
    } = await searchImg(q, page);
    const totalPage = Math.ceil(totalHits / perPage);

    if (page < totalPage) {
      loaderBottom.style.display = 'none';
      loadingBtn.style.display = 'block';
        gallery.insertAdjacentHTML('beforeend', renderImg(hits));
        lightbox.refresh();
    } else {
      loaderBottom.style.display = 'none';
      loadingBtn.style.display = 'none';

      return iziToast.info({
        position: 'topRight',
        message: `We're sorry, but you've reached the end of search results.`,
      });
    }
  } catch (error) {
    console.log(error);
  } 

  const listItem = document.querySelector('.gallery-item:first-child');
  const itemHeight = listItem.getBoundingClientRect().height;
  console.log(itemHeight);
  console.log(listItem);
  window.scrollBy({
    top: 2 * itemHeight,
    behavior: 'smooth',
  });
}