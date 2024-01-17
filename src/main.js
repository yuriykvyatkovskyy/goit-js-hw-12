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
let per_page = 40;

const lightbox = new SimpleLightbox('.gallery a', {
    nav: true,
    captionDelay: 250,
    captionsData: 'alt',
    close: true,
    enableKeyboard: true,
    docClose: true,
});

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

    if (total <= per_page) {
      loadingBtn.style.display = 'none';
    }
  } catch (error) {
    console.log('Error');
  } finally {
    loader.style.display = 'none';
    form.reset();
  }
}

