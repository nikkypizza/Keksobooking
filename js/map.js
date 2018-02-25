'use strict';

// Константы кнопок
var KEYCODE_ESC = 27;
var KEYCODE_ENTER = 13;
var KEYCODE_SPACE = 32;

// Общее количество предложений
var OFFERS_COUNT = 8;

var ALL_TITLES = [
  'Большая уютная квартира',
  'Маленькая неуютная квартира',
  'Огромный прекрасный дворец',
  'Маленький ужасный дворец',
  'Красивый гостевой домик',
  'Некрасивый негостеприимный домик',
  'Уютное бунгало далеко от моря',
  'Неуютное бунгало по колено в воде'
];

var ALL_PHOTOS = [
  'http://o0.github.io/assets/images/tokyo/hotel1.jpg',
  'http://o0.github.io/assets/images/tokyo/hotel2.jpg',
  'http://o0.github.io/assets/images/tokyo/hotel3.jpg'
];

var LIST_CHECK_IN = [
  '12:00',
  '13:00',
  '14:00'
];

var LIST_CHECK_OUT = [
  '12:00',
  '13:00',
  '14:00'
];

// Массив с типом жилья
var LIST_APARTMENT_TYPES = {
  flat: 'Квартира',
  bungalo: 'Бунгало',
  house: 'Дом'
};

// Массив с удобствами
var FEATURES = [
  'wifi',
  'dishwasher',
  'parking',
  'washer',
  'elevator',
  'conditioner'
];

// Возвращает URL аватара
var getAvatarUrl = function (avatar) {
  return 'img/avatars/user' + addZero(avatar) + '.png';
};

// Добавляет 0, если num = число однозначное
var addZero = function (num) {
  return (num < 10 ? '0' : '') + num;
};

// Делает чило кратным 100. Срежем мелочь от рандомной цены
function roundTo100(num) {
  return Math.round(num / 100) * 100;
}

// Генерирует случайное число от min до max. Если третий параметр = true, то включает max
var getRandomNumber = function (min, max, includeMax) {
  var addMax = includeMax ? 1 : 0;
  return Math.floor(Math.random() * (max - min + addMax) + min);
};

// Возвращает массив значений произвольной длины
var getArrayOfRandomLength = function (srcArray) {
  var randomLength = getRandomNumber(0, srcArray.length, true);
  return srcArray.slice(0, randomLength);
};

// Возвращает случайный элемент массива
var getRandomElem = function (srcArray) {
  return srcArray[getRandomNumber(0, srcArray.length)];
};

/* Возвращает перемешаный массив
   Тасование Фишера — Йетса      */
function getShuffleArray(array) {
  var m = array.length;
  var t;
  var i;

  // Пока еще остаются элементы для тасования...
  while (m) {
    // Берем остающийся элемент...
    i = Math.floor(Math.random() * m--);
    // И меняем его местами с текущим элементом
    t = array[m];
    array[m] = array[i];
    array[i] = t;
  }
  return array;
}

// Создает массив объявлений
var getOffersArray = function (quantity) {
  var offersArray = [];
  var currentOffer;
  var shuffleTitles = getShuffleArray(ALL_TITLES);

  for (var i = 0; i < quantity; i += 1) {
    var x = getRandomNumber(300, 900, true);
    var y = getRandomNumber(150, 500, true);

    currentOffer = {
      author: {
        avatar: getAvatarUrl(i + 1)
      },
      offer: {
        title: shuffleTitles[i],
        address: 'x:' + x + ', y:' + y,
        price: roundTo100(getRandomNumber(1000, 1000000, true)),
        type: getRandomElem(Object.keys(LIST_APARTMENT_TYPES)),
        rooms: getRandomNumber(1, 5, true),
        guests: getRandomNumber(1, 10, true),
        checkin: getRandomElem(LIST_CHECK_IN),
        checkout: getRandomElem(LIST_CHECK_OUT),
        features: getArrayOfRandomLength(FEATURES),
        description: '',
        photos: ALL_PHOTOS
      },
      location: {
        x: x,
        y: y
      }
    };
    offersArray.push(currentOffer);
  }

  return offersArray;
};

var offersArray = getOffersArray(OFFERS_COUNT);
var CURRENT_OFFER = offersArray[0];

var pinTemplateNode = document.querySelector('template').content.querySelector('.map__pin');
var pinImgNode = pinTemplateNode.querySelector('img');

// Объявление фрагмента пина
var createPinElem = function (coordinates, avatar, dataIndex) {

  var pinElem = pinTemplateNode.cloneNode(true);
  pinElem.querySelector('img').src = avatar;

  pinElem.style.left = coordinates.x - PIN_WIDTH + 'px';
  pinElem.style.top = coordinates.y - PIN_HEIGHT + 'px';
  pinElem.classList.add('map__pin');
  pinElem.dataset.offer = dataIndex;

  return pinElem;
};

// Константы пина
var PIN_WIDTH = pinImgNode.getAttribute('width');
var PIN_HEIGHT = parseFloat(pinImgNode.getAttribute('height'));

// Отрисовка фрагмента пина
var renderPins = function (offers) {
  var pinFragment = document.createDocumentFragment();

  offers.forEach(function (offer, index) {
    pinFragment.appendChild(createPinElem(offer.location, offer.author.avatar, index));
  });

  return pinFragment;
};


// Объявление фрагмента фичи
var createFeaturesElem = function (feature) {
  var featureElem = document.createElement('li');
  featureElem.classList.add('feature', 'feature--' + feature);

  return featureElem;
};

// Отрисовка фрагмент фичи
var renderFeaturesElem = function (featuresArray) {
  var featuresFragment = document.createDocumentFragment();

  featuresArray.forEach(function (feature) {
    featuresFragment.appendChild(createFeaturesElem(feature));
  });

  return featuresFragment;
};


// Отрисовка объявления
var renderOffer = function (currentOffer) {
  var offerElem = document.querySelector('template').content.querySelector('article.map__card').cloneNode(true);
  var photoList = offerElem.querySelector('.popup__pictures');
  var shuffledPhotos = getShuffleArray(currentOffer.offer.photos);

  // Склоняет слово "комната" в зависимости от количества
  var createRoomPluralName = function () {
    var roomNoun = 'комнаты';
    var roomNumber = currentOffer.offer.rooms;
    if (roomNumber === 1) {
      roomNoun = 'комната';
    }
    if (roomNumber > 4) {
      roomNoun = 'комнат';
    }
    return roomNoun;
  };

  // Склоняет слово "гость" в зависимости от количества
  var createGuestPluralName = function () {
    var guestNoun;
    guestNoun = currentOffer.offer.guests === 1 ? 'гостя' : 'гостей';
    return guestNoun;
  };

  offerElem.querySelector('h3').textContent = currentOffer.offer.title;
  offerElem.querySelector('p small').textContent = currentOffer.offer.address;
  offerElem.querySelector('.popup__price').textContent = currentOffer.offer.price.toLocaleString() + ' ₽/ночь';
  offerElem.querySelector('h4').textContent = LIST_APARTMENT_TYPES[currentOffer.offer.type];
  offerElem.querySelector('h4 + p').textContent = currentOffer.offer.rooms + ' ' + createRoomPluralName() + ' для ' + currentOffer.offer.guests + ' ' + createGuestPluralName();
  offerElem.querySelector('h4 + p + p').textContent = 'Заезд после ' + currentOffer.offer.checkin + ',' + ' выезд до ' + currentOffer.offer.checkout;
  offerElem.querySelector('ul + p').textContent = currentOffer.offer.description;
  offerElem.querySelector('.popup__avatar').src = currentOffer.author.avatar;
  offerElem.querySelector('.popup__features').innerHTML = '';

  for (var i = 0; i < 3; i++) {
    var photoElement = photoList.querySelector('li').cloneNode(true);
    photoList.appendChild(photoElement);

    photoElement.querySelector('img').style.width = '65px';
    photoElement.querySelector('img').style.height = '65px';
    photoElement.querySelector('img').style.padding = '0 3px 0 0';
    photoElement.querySelector('img').src = shuffledPhotos[i];
  }

  return offerElem;
};

// Отрисовывает карту, включая пины и объявление
var renderMap = function () {
  var mapElem = document.querySelector('.map');
  mapElem.classList.remove('map--faded');

  var fragment = document.createDocumentFragment();

  var mapFiltersElem = document.querySelector('.map__filters-container');
  var offerElem = renderOffer(CURRENT_OFFER);

  offerElem.querySelector('.popup__features').appendChild(renderFeaturesElem(CURRENT_OFFER.offer.features));
  mapPinsNode.appendChild(renderPins(offersArray));
  fragment.appendChild(offerElem);
  mapFiltersElem.appendChild(fragment);
};

var mapNode = document.querySelector('.map');
var addressNode = document.getElementById('address');
var mapPinMainNode = mapNode.querySelector('.map__pin--main');
var mapPinsNode = document.querySelector('.map__pins');
var mapFiltersFormNode = document.querySelector('.map').querySelector('.map__filters');

var noticeFormNode = document.querySelector('.notice__form');

// Добавляет или убирает аттрибут disabled нодам формы
var toggleDisabledOnFormNodes = function (formElementNodes, isDisabled) {
  var elementNodes = Array.prototype.slice.call(formElementNodes);

  elementNodes.forEach(function (elementNode) {
    elementNode.disabled = isDisabled;
  });
};

toggleDisabledOnFormNodes(noticeFormNode, true);
toggleDisabledOnFormNodes(mapFiltersFormNode, true);

// Отключает все поля формы по умолчанию
noticeFormNode.style = 'pointer-events:none';

// Добавляет координаты main пина в адресную строку
addressNode.value = 'x:' + (mapPinMainNode.offsetLeft + PIN_WIDTH / 2) + ', y:' + (mapPinMainNode.offsetTop + PIN_HEIGHT + 22);


var closePopup = function () {
  var popupNode = document.querySelector('.map__card');
  popupNode.classList.add('hidden');
};

var onPopupEscPress = function (event) {
  if (event.keyCode === KEYCODE_ESC) {
    closePopup();
  }
};

// Вешает закрывателей на ноду попапа
var addPopupCloseHandlers = function () {
  var popupCloseElem = document.querySelector('.popup__close');

  popupCloseElem.addEventListener('click', function () {
    closePopup();
  });
  document.addEventListener('keydown', onPopupEscPress);
};

// Отрисовывает пины, снимает блокировку с элементов форм
var enableInteractivity = function () {
  mapNode.classList.remove('map--faded');
  noticeFormNode.classList.remove('notice__form--disabled');
  mapPinMainNode.style = 'z-index: 10';

  toggleDisabledOnFormNodes(noticeFormNode, false);
  toggleDisabledOnFormNodes(mapFiltersFormNode, false);
  noticeFormNode.removeAttribute('style');

  // Оставляет поле адреса визуально неактивным
  addressNode.style = 'pointer-events:none';
  addressNode.previousElementSibling.style = 'pointer-events:none';

  renderMap();
  addPopupCloseHandlers();
};

// Удаляет обработчик кнопки после того, как он отрабатывает
var onUserPinEnterPress = function (event) {
  if (event.keyCode === KEYCODE_ENTER || event.keyCode === KEYCODE_SPACE) {
    enableInteractivity();
    mapPinMainNode.removeEventListener('mouseup', onUserPinMouseUp);
    mapPinMainNode.removeEventListener('keydown', onUserPinEnterPress);
  }
};

// Удаляет обработчик клика после того, как он отрабатывает
var onUserPinMouseUp = function () {
  enableInteractivity();
  mapPinMainNode.removeEventListener('mouseup', onUserPinMouseUp);
  mapPinMainNode.removeEventListener('keydown', onUserPinEnterPress);
};

// Добавляет обработчиков на главный пин
mapPinMainNode.addEventListener('mouseup', onUserPinMouseUp);
mapPinMainNode.addEventListener('keydown', onUserPinEnterPress);


// Матчит дата-аттрибут пина с индексом соответствующего пину объявления
var getClickedPinOffer = function (eventTarget) {
  var offerIndex = parseFloat(eventTarget.dataset.offer);
  return offersArray[offerIndex];
};

// Рендерит объявление с заменой предыдущего (если оно было)
var renderPopup = function (offer) {
  var mapFiltersNode = document.querySelector('.map__filters-container');

  var oldOfferNode = mapFiltersNode.querySelector('.map__card');
  var offerElem = renderOffer(offer);

  if (oldOfferNode) {
    mapFiltersNode.replaceChild(offerElem, oldOfferNode);
  } else {
    mapFiltersNode.appendChild(offerElem);
  }
};


// Приниммет цель события и элемент, на котором этом событие ловим. Использует всплытие, чтобы поймать нужный элемент и возвращает его.
var findClosestElem = function (target, elem) {
  var closestElem;

  while (target.className !== mapPinsNode.className) {
    if (target.className === elem) {
      closestElem = target;
    }
    target = target.parentNode;
  }

  return closestElem;
};


// Клик всплывает до нужной ноды. Когда находит нужную - заменяет попап и вешает на него отслеживание закрытия
var onOfferPinClick = function (event) {
  var clickedPin = findClosestElem(event.target, 'map__pin');

  if (clickedPin) {
    renderPopup(getClickedPinOffer(clickedPin));
    document.querySelector('.map__card').classList.remove('hidden');
    addPopupCloseHandlers();
  }
};

mapPinsNode.addEventListener('click', onOfferPinClick);


var MIN_PRICES = {
  bungalo: '0',
  flat: '1000',
  house: '5000',
  palace: '10000'
};

var userFormNode = document.querySelector('.notice__form');

var checkinSelectNode = userFormNode.querySelector('#timein');
var checkoutSelectNode = userFormNode.querySelector('#timeout');

var typeSelectNode = userFormNode.querySelector('#type');
var priceInputNode = userFormNode.querySelector('#price');

var numOfRoomsSelectNode = userFormNode.querySelector('#room_number');
var capacitySelectNode = userFormNode.querySelector('#capacity');


// При выборе опции селекта из первого параметра выбирает опцию с аналогичным значением у селекта из второго параметра
var syncSelectNodesValue = function (changedSelect, syncingSelect) {
  var selectedValue = changedSelect.options[changedSelect.selectedIndex].value;

  for (var i = 0; i < syncingSelect.length; i += 1) {
    if (syncingSelect[i].value === selectedValue) {
      syncingSelect[i].selected = true;
      break;
    }
  }
};

// Задает минимальную цену за ночь
var syncTypeWithMinPrice = function () {
  var selectedType = typeSelectNode.options[typeSelectNode.selectedIndex].value;
  priceInputNode.min = MIN_PRICES[selectedType];
  priceInputNode.placeholder = MIN_PRICES[selectedType];
};

var syncRoomsWithGuests = function () {
  var roomSelectValue = numOfRoomsSelectNode.options[numOfRoomsSelectNode.selectedIndex].value;

  var notForGuestsOption = capacitySelectNode.querySelector('option[value="0"]');
  var oneGuestsOption = capacitySelectNode.querySelector('option[value="1"]');
  var twoGuestsOption = capacitySelectNode.querySelector('option[value="2"]');
  var threeGuestsOption = capacitySelectNode.querySelector('option[value="3"]');

  if (roomSelectValue === '1') {
    oneGuestsOption.selected = true;
    oneGuestsOption.disabled = false;

    notForGuestsOption.disabled = true;
    twoGuestsOption.disabled = true;
    threeGuestsOption.disabled = true;
  }
  if (roomSelectValue === '2') {
    oneGuestsOption.selected = true;
    oneGuestsOption.disabled = false;
    twoGuestsOption.disabled = false;

    notForGuestsOption.disabled = true;
    threeGuestsOption.disabled = true;
  }
  if (roomSelectValue === '3') {
    oneGuestsOption.selected = true;
    oneGuestsOption.disabled = false;
    twoGuestsOption.disabled = false;
    threeGuestsOption.disabled = false;

    notForGuestsOption.disabled = true;
  }
  if (roomSelectValue === '100') {
    notForGuestsOption.selected = true;
    notForGuestsOption.disabled = false;

    oneGuestsOption.disabled = true;
    twoGuestsOption.disabled = true;
    threeGuestsOption.disabled = true;
  }
};

var onUserFormNodeChange = function (event) {
  var target = event.target;

  if (target === checkinSelectNode) {
    syncSelectNodesValue(checkinSelectNode, checkoutSelectNode);
  }
  if (target === checkoutSelectNode) {
    syncSelectNodesValue(checkoutSelectNode, checkinSelectNode);
  }
  if (target === typeSelectNode) {
    syncTypeWithMinPrice();
  }
  if (target === numOfRoomsSelectNode) {
    syncRoomsWithGuests();
  }
};


syncRoomsWithGuests();
userFormNode.addEventListener('change', onUserFormNodeChange);
