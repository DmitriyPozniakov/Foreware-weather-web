// https://api.opencagedata.com/geocode/v1/json?q=52.3877830%2C9.7334394&key=395938322cd54fbe91fce9e547206753
//http://api.weatherapi.com/v1/current.json?key=${API_KEY_NEW}&q=${lat},${lng}
// http://api.weatherapi.com/v1/current.json?key=${API_KEY_NEW}&q=${city}
// import { API_KEY } from "./config.js";

'use strict';
const API_KEY = 'b2515713b38048e9bfc145548240407';

class App {
    #input = document.querySelector('.search-city-inp');
    #parentEl = document.querySelector('.your-loc-info');
    #parentWrapper = document.querySelector('.wrapper-info');
    #form = document.querySelector('form');
    #themeSwitcher = document.getElementById('switcher');
    #parentQuickWeather = document.querySelector('.wrapper-weather');
    #Modal = document.querySelector('.pop-up-add-item');
    #wrapperModal = document.querySelector('.modal');
    #parentElPopUp = document.querySelector('.city-list');

    #mainForecast = document.querySelector('.main-info');
    #windForecast = document.querySelector('.wind-article');
    #tempFeel = document.querySelector('.temp-feel')
    #allForecast = document.querySelector('.all');

    #background = document.querySelector('body');
    #addItemButton = document.querySelector('.add-new-item');


    constructor() {
        this.#checkTheme();
        this.#addHandler();
        this.#getQuickWeather('Stambul');
        this.#getQuickWeather('Paris');
        this.#getQuickWeather('Los Angeles');
        this.#getQuickWeather('New York');
        this.#addNewCity();
        this.#checkPosition();
        this.#init();

    }

    #checkPosition() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                this.#getCoords.bind(this),
                () => {
                    this.#renderError('Oops... Unable to get your position');
                }
            );
        }
    }

    // for future responsive
    #init() {
        this.currentWidth = document.body.clientWidth;
        this.#checkWidth();
        window.addEventListener('resize', this.#checkWidth.bind(this));
    }

    #checkWidth() {
        const newWidth = document.body.clientWidth;
        if (newWidth !== this.currentWidth) {
            // console.log(`Ширина <body> изменилась: ${newWidth + 16}px`);
            this.currentWidth = newWidth;
        }
    }

    getCurrentWidth() {
        return this.currentWidth;
    }

    #getCoords(position) {
        const { latitude: lat, longitude: lon } = position.coords;
        this.#getWeather([lat, lon])
    }

    #checkTheme() {
        this.#themeSwitcher.addEventListener('change', () => {
            if (this.#themeSwitcher.checked) this.#addDarkTheme();
            else this.#addLightTheme();
        });
    }

    #addLightTheme() {
        this.#background.classList.remove('dark-background');
        this.#input.classList.remove('dark-input');
        this.#addItemButton.classList.remove('dark-input');
        this.#windForecast.classList.remove('chgBack');
        this.#tempFeel.classList.remove('chgBack');
        this.#allForecast.classList.remove('chgBack');
        this.#Modal.classList.remove('dark-background');

        document.querySelectorAll('.title-section').forEach(el => el.style.color = '#005EA1')
        this.#mainForecast.style.background = "url('img/background.png')";
        document.querySelectorAll('.pre-heading, .info, .temp-feel-val, .heading-error').forEach(el => el.classList.remove('pre-heading-dark'));
    }

    #addDarkTheme() {
        this.#background.classList.add('dark-background');
        this.#input.classList.add('dark-input');
        this.#addItemButton.classList.add('dark-input');
        this.#windForecast.classList.add('chgBack');
        this.#tempFeel.classList.add('chgBack');
        this.#allForecast.classList.add('chgBack');
        this.#Modal.classList.add('dark-background');

        document.querySelectorAll('.title-section').forEach(el => el.style.color = '#fff')
        this.#mainForecast.style.background = "url('img/BG-night.png')";
        document.querySelectorAll('.pre-heading, .info, .temp-feel-val, .heading-error').forEach(el => el.classList.add('pre-heading-dark'));
    }

    #clearForm() {
        this.#mainForecast.innerHTML = ''
        this.#windForecast.innerHTML = '';
        this.#tempFeel.innerHTML = '';
        this.#allForecast.innerHTML = '';
    }

    #clearInput() {
        this.#input.value = '';
    }

    #addHandler() {
        this.#form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.#getOtherCity();
            this.#clearInput();
        });
    }

    #renderAll(data) {
        if (document.querySelector('.error-section')) {
            document.querySelector('.error-section').style.display = 'none';
            this.#parentWrapper.style.display = 'grid';
        }

        this.#clearForm();
        this.#renderMainInfo(data);
        this.#renderWindInfo(data);
        this.#renderTempFeelInfo(data);
        this.#renderAllInfo(data);
    }

    #getOtherCity() {
        const city = this.#input.value;
        this.#getWeather(city)
    }

    async #getWeather(query) {
        try {
            let url = '';
            if (typeof query === 'string') {
                url = `http://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${query}`;
            }
            else if (Array.isArray(query) && query.length === 2) {
                const [lat, lon] = query;
                url = `http://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${lat},${lon}`;
            }
            else throw new Error('Invalid query type. Provide either a city name.');

            const res = await fetch(url);
            if (!res.ok) {
                throw new Error(`HTTP error! Status: ${res.status}`);
            }

            const data = await res.json();
            this.#renderAll(data);

        } catch (err) {
            this.#renderError('Oops... Wrong query');
        }
    }

    async #getQuickWeather(city) {
        try {
            const res = await fetch(`http://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${city}`);
            if (!res.ok) {
                throw new Error(`HTTP error! Status: ${res.status}`);
            }
            const data = await res.json();

            this.#renderQuickWeather(data, this.#parentQuickWeather);
            this.#renderQuickWeather(data, this.#parentElPopUp);

            return data;
        }
        catch (err) {
            this.#renderError('Oops... Wrong query in quick-watch weather');
        }
    }

    #addNewCity() {
        this.#addItemButton.addEventListener('click', () => {
            this.#renderPopUp();
        })
    }

    #closePopUp() {
        // Закрытие поп-апа при клике на кнопку с классом 'closeModal'
        document.querySelector('.closeModal').addEventListener('click', (event) => {
            this.#wrapperModal.style.display = 'none';
        });
    }

    #renderQuickWeather(data, parentElement) {

        if (parentElement === this.#parentQuickWeather) {
            // Проверяем, если ли уже три карточки
            const weatherCards = parentElement.querySelectorAll('.weather-card');
            if (weatherCards.length >= 3) {
                // Удаляем последнюю карточку, чтобы освободить место для новой
                parentElement.removeChild(weatherCards[weatherCards.length - 1]);
            }
        }

        if (parentElement === this.#parentElPopUp) {
            const weatherCards = parentElement.querySelectorAll('.weather-card');
            if (weatherCards.length >= 4) {
                // Удаляем последнюю карточку, чтобы освободить место для новой
                parentElement.removeChild(weatherCards[weatherCards.length - 1]);
            }
        }

        const markup = `<div class="weather-card ${data.current.is_day ? 'day' : 'night'}">
            <div class="line-1">
                <div class="temp-cond-wrapper">
                <span class="temp">${Math.trunc(data.current.temp_c)}°</span>
                    <p class="cond">${data.current.condition.text.trim().split(/\s+/).slice(0, 4).join(' ')}</p>
                </div>
                <img src="https:${data.current.condition.icon}" alt="" class="cond-img">
                </div>
                <div class="line-2">
                    <img src="img/icon.svg" alt="" class="where-city">
                    <span class="city">${data.location.name}</span>
                </div>
            </div>`

        parentElement.insertAdjacentHTML('afterbegin', markup);
    }

    #clearPopUp() {
        document.querySelector('.popUp-wrapper').innerHTML = '';
    }

    #renderPopUp() {
        const markup = `
         <div class="popUp-wrapper">
            <div class="header-pop-up">
                <h2 class="addCity">Add a new city</h2>
                <button class="closeModal"><img src="img/closeBtn.svg" alt=""></button>
            </div>
                <div class="search-box">
                    <svg xmlns="http://www.w3.org/2000/svg" width="21" height="20" viewBox="0 0 21 20" fill="none">
                        <path
                        d="M15.9167 15.4165L18.8334 18.3332M18.0001 9.58317C18.0001 5.21092 14.4557 1.6665 10.0834 1.6665C5.71116 1.6665 2.16675 5.21092 2.16675 9.58317C2.16675 13.9554 5.71116 17.4998 10.0834 17.4998C14.4557 17.4998 18.0001 13.9554 18.0001 9.58317Z"
                        stroke="#014170" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                    <input type="text" placeholder="Search a city" class="pop-up-input">
                    </div>
                    <p class="title-section">Popular cities</p>
            </div>
            `
        this.#clearPopUp();
        this.#Modal.insertAdjacentHTML('afterbegin', markup)
        this.#wrapperModal.style.display = 'flex';

        if (this.#themeSwitcher.checked) {
            document.querySelector('.addCity').classList.add('pre-heading-dark');
            document.querySelector('.pop-up-input').classList.add('dark-input');
        } else {
            document.querySelector('.addCity').classList.remove('pre-heading-dark');
            document.querySelector('.pop-up-input').classList.remove('dark-input');
        }

        this.#getNewCityPopUp();
        this.#closePopUp();
    }

    #getNewCityPopUp() {
        const inputPopUp = document.querySelector('.pop-up-input');
        inputPopUp.focus();
        inputPopUp.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                const city = inputPopUp.value;
                this.#getQuickWeather(city);
                inputPopUp.value = '';
            }
        });
    }

    #renderError(problem = 'Oops... Something went wrong') {
        this.#parentEl.style.display = 'flex';

        // Проверяем и удаляем предыдущую ошибку, если она есть
        const existingError = this.#parentEl.querySelector('.error-section');
        if (existingError) {
            existingError.remove();
        }

        const markup = `
          <div class="error-section">
                <img src="img/Avatar_${problem.includes('position') ? 'man' : 'woman'}.svg" alt="" class="error-man">
                <div class="text-error">
                  <h2 class="heading-error">${problem}</h2>
                  <p class="article-error">Please, try again later.</p>  
                </div>
            </div>`

        this.#parentWrapper.style.display = 'none';
        this.#parentEl.insertAdjacentHTML('afterbegin', markup);

        if (this.#themeSwitcher.checked) {
            document.querySelector('.heading-error').classList.add('pre-heading-dark');
            document.querySelectorAll('.pre-heading').forEach(el => el.classList.add('pre-heading-dark'));
            document.querySelectorAll('.info').forEach(el => el.classList.add('pre-heading-dark'));
        } else {
            document.querySelector('.heading-error').classList.remove('pre-heading-dark');
            document.querySelectorAll('.pre-heading').forEach(el => el.classList.remove('pre-heading-dark'));
            document.querySelectorAll('.info').forEach(el => el.classList.remove('pre-heading-dark'));
        }

    }

    #renderMainInfo(data) {
        const markup = ` 
        <p class="main-temp">${Math.trunc(data.current.temp_c)}°</p>
        <p class="main-loc">${data.location.name}, ${data.location.country}</p>
        <p class="weather-cond">${data.current.condition.text}</p>`
        this.#mainForecast.insertAdjacentHTML('afterbegin', markup)
    }

    #renderWindInfo(data) {
        const markup = `
        <div class="wrap">
            <img src="img/wind.svg" alt="" class="wind-ic">
            <p class="par-art">wind</p>
            </div>
            <div class="main-div">
            <div class="left-div">
                    <p class="pre-heading">Wind</p>
                    <p class="info">${Math.trunc(data.current.wind_kph)} <span class="info-span">M/S</span></p>
                    </div>
                    <div class="right-div">
                        <p class="pre-heading">Gusts</p>
                        <p class="info">${Math.trunc(data.current.gust_kph)} <span class="info-span">M/S</span></p>
                        </div>
            </div>`
        this.#windForecast.insertAdjacentHTML('afterbegin', markup);
        if (this.#themeSwitcher.checked) {
            document.querySelectorAll('.pre-heading').forEach(el => el.classList.add('pre-heading-dark'));
            document.querySelectorAll('.info').forEach(el => el.classList.add('pre-heading-dark'));
        } else {
            document.querySelectorAll('.pre-heading').forEach(el => el.classList.remove('pre-heading-dark'));
            document.querySelectorAll('.info').forEach(el => el.classList.remove('pre-heading-dark'));
        }

    }

    #renderTempFeelInfo(data) {
        const markup = ` 
        <div class="wrap">
            <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44" fill="none">
            <path
            d="M21.9999 40.3332C27.0625 40.3332 31.1666 36.2291 31.1666 31.1665C31.1666 28.1675 29.7264 25.5049 27.4999 23.8325V9.1665C27.4999 6.12894 25.0375 3.6665 21.9999 3.6665C18.9624 3.6665 16.4999 6.12894 16.4999 9.1665V23.8325C14.2734 25.5049 12.8333 28.1675 12.8333 31.1665C12.8333 36.2291 16.9373 40.3332 21.9999 40.3332Z"
            stroke="#0067A1" stroke-width="2" stroke-linejoin="round" />
            </svg>
            <p class="par-art">Temperature feel</p>
            </div>
            <p class="temp-feel-val">${Math.trunc(data.current.feelslike_c)}°</p>
            <p class="feels-like">${Math.trunc(data.current.temp_c) === Math.trunc(data.current.feelslike_c) ? 'Feels the same to real temp.' : 'Feels not the same to real temp.'}</p>`
        this.#tempFeel.insertAdjacentHTML('afterbegin', markup)
        if (this.#themeSwitcher.checked) {
            document.querySelector('.temp-feel-val').classList.add('pre-heading-dark');
        } else {
            document.querySelector('.temp-feel-val').classList.remove('pre-heading-dark');
        }
    }


    #renderAllInfo(data) {
        const markup = `
            <div class="left">
                <div class="wrap">
                    <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44"
                    fill="none">
                    <path
                    d="M40.3334 34.8333L35.5391 31.9567C32.9107 30.3796 29.5786 30.6038 27.1851 32.5186L26.5812 33.0017C23.9029 35.1443 20.0973 35.1443 17.419 33.0017L16.8151 32.5186C14.4215 30.6038 11.0895 30.3796 8.46103 31.9567L3.66675 34.8333M40.3334 23.8333L35.5391 20.9567C32.9107 19.3796 29.5786 19.6038 27.1851 21.5186L26.5812 22.0017C23.9029 24.1443 20.0973 24.1443 17.419 22.0017L16.8151 21.5186C14.4215 19.6038 11.0895 19.3796 8.46103 20.9567L3.66675 23.8333M40.3334 12.8333L35.5391 9.95671C32.9107 8.37964 29.5786 8.60376 27.1851 10.5186L26.5812 11.0017C23.9029 13.1443 20.0973 13.1443 17.419 11.0017L16.8151 10.5186C14.4215 8.60376 11.0895 8.37964 8.46103 9.95671L3.66675 12.8333"
                    stroke="#0067A1" stroke-width="2" stroke-linecap="round" />
                    </svg>
                        <p class="par-art">humidity</p>
                </div>
                    <p class="info">${Math.trunc(data.current.humidity)}%</p>
                        <div class="wrap">
                            <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44"
                            fill="none">
                            <path
                            d="M38.739 18.0641C40.8649 20.3009 40.8649 23.6993 38.739 25.9361C35.1533 29.7086 28.9952 34.8334 22.0001 34.8334C15.005 34.8334 8.84682 29.7086 5.26121 25.9361C3.13526 23.6993 3.13526 20.3009 5.26121 18.0641C8.84682 14.2915 15.005 9.16675 22.0001 9.16675C28.9952 9.16675 35.1533 14.2915 38.739 18.0641Z"
                            stroke="#0067A1" stroke-width="2" />
                            <path
                            d="M27.5001 22.0001C27.5001 25.0376 25.0376 27.5001 22.0001 27.5001C18.9625 27.5001 16.5001 25.0376 16.5001 22.0001C16.5001 18.9625 18.9625 16.5001 22.0001 16.5001C25.0376 16.5001 27.5001 18.9625 27.5001 22.0001Z"
                            stroke="#0067A1" stroke-width="2" />
                            </svg>
                                <p class="par-art">visibility</p>
                        </div>
                            <p class="info">${Math.trunc(data.current.vis_km)} KM</p>
                        </div>
                        <div class="right">
                            <div class="wrap">
                                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"
                                    fill="none">
                                    <path
                                        d="M20.0001 1.6665V3.49984M20.0001 36.4998V38.3332M32.9637 7.03623L31.6674 8.33259M8.33283 31.6671L7.03647 32.9634M38.3334 19.9998H36.5001M3.50008 19.9998H1.66675M32.9637 32.9634L31.6673 31.6671M8.33283 8.33259L7.03647 7.03623M31.0001 19.9998C31.0001 26.075 26.0752 30.9998 20.0001 30.9998C13.9249 30.9998 9.00008 26.075 9.00008 19.9998C9.00008 13.9247 13.9249 8.99984 20.0001 8.99984C26.0752 8.99984 31.0001 13.9247 31.0001 19.9998Z"
                                        stroke="#0067A1" stroke-width="2" stroke-linecap="round" />
                                </svg>
                                </svg>
                                <p class="par-art">heatindex</p>
                            </div>
                            <p class="info">${Math.trunc(data.current.heatindex_c)} HIGH</p>
                            
                            <div class="wrap">
                                <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44"
                                    fill="none">
                                    <path
                                        d="M31.12 18.8765C31.4201 19.3402 32.0392 19.4728 32.5028 19.1728C32.9665 18.8728 33.0992 18.2536 32.7991 17.79L31.12 18.8765ZM11.201 17.79C10.9009 18.2536 11.0336 18.8728 11.4972 19.1728C11.9609 19.4728 12.58 19.3402 12.8801 18.8765L11.201 17.79ZM28.3576 22.5144C28.6417 22.0408 28.4882 21.4266 28.0146 21.1424C27.541 20.8583 26.9267 21.0118 26.6426 21.4854L28.3576 22.5144ZM11.0001 37.6666H33.0001V35.6666H11.0001V37.6666ZM41.3334 29.3333V25.6666H39.3334V29.3333H41.3334ZM2.66675 25.6666V29.3333H4.66675V25.6666H2.66675ZM22.0001 6.33325C11.3226 6.33325 2.66675 14.9891 2.66675 25.6666H4.66675C4.66675 16.0936 12.4271 8.33325 22.0001 8.33325V6.33325ZM41.3334 25.6666C41.3334 14.9891 32.6776 6.33325 22.0001 6.33325V8.33325C31.573 8.33325 39.3334 16.0936 39.3334 25.6666H41.3334ZM33.0001 37.6666C37.6025 37.6666 41.3334 33.9356 41.3334 29.3333H39.3334C39.3334 32.8311 36.4979 35.6666 33.0001 35.6666V37.6666ZM11.0001 35.6666C7.50228 35.6666 4.66675 32.8311 4.66675 29.3333H2.66675C2.66675 33.9356 6.39771 37.6666 11.0001 37.6666V35.6666ZM17.5001 36.6666C17.5001 34.1813 19.5148 32.1666 22.0001 32.1666V30.1666C18.4102 30.1666 15.5001 33.0767 15.5001 36.6666H17.5001ZM22.0001 32.1666C24.4854 32.1666 26.5001 34.1813 26.5001 36.6666H28.5001C28.5001 33.0767 25.5899 30.1666 22.0001 30.1666V32.1666ZM22 13.8333C26.6315 13.8333 29.337 16.1212 31.12 18.8765L32.7991 17.79C30.7468 14.6185 27.4745 11.8333 22 11.8333V13.8333ZM12.8801 18.8765C14.6631 16.1212 17.3685 13.8333 22 13.8333V11.8333C16.5256 11.8333 13.2532 14.6185 11.201 17.79L12.8801 18.8765ZM22.8576 31.6811L28.3576 22.5144L26.6426 21.4854L21.1426 30.6521L22.8576 31.6811Z"
                                        fill="#0067A1" />
                                </svg>
                                <p class="par-art">pressure</p>
                                </div>
                            <p class="info">${Math.trunc(data.current.pressure_mb)} hPA</p>
                        </div>
                    </div>`

        this.#allForecast.insertAdjacentHTML('afterbegin', markup)
        if (this.#themeSwitcher.checked) {
            document.querySelectorAll('.info').forEach(el => el.classList.add('pre-heading-dark'));
        } else {
            document.querySelectorAll('.info').forEach(el => el.classList.remove('pre-heading-dark'));
        }
    }


}

const app = new App();