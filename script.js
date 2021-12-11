'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2021-09-08T14:11:59.604Z',
    '2021-09-09T17:01:17.194Z',
    '2021-09-10T23:36:17.929Z',
    '2021-09-11T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions

const formatMovementDate = function (date, locale) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

  const daysPassed = calcDaysPassed(new Date(), date);
  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;
  else {
    /*
    const day = `${date.getDate()}`.padStart(2, 0);
    const month = `${date.getMonth() + 1}`.padStart(2, 0);
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
    */
    return new Intl.DateTimeFormat(locale).format(date);
  }
};

const formatCur = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};

const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatMovementDate(date, acc.locale);

    const formattedMov = formatCur(mov, acc.locale, acc.currency);

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
    <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${formattedMov}</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);

  labelBalance.textContent = formatCur(acc.balance, acc.locale, acc.currency);
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = formatCur(incomes, acc.locale, acc.currency);

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = formatCur(Math.abs(out), acc.locale, acc.currency);

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = formatCur(interest, acc.locale, acc.currency);
};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

const startLogOutTimer = function () {
  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);

    //In each call,print the remaining time to UI
    labelTimer.textContent = `${min}:${sec}`;

    //when 0 seconds stop timer and log out user
    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = `Log in to get started`;
      containerApp.style.opacity = 0;
    }
    //decrease timer by 1
    time--;
  };
  //Set time to 5 minutes
  let time = 120;

  //Call the timer every second
  tick();
  const timer = setInterval(tick, 1000);
  return timer;
};

///////////////////////////////////////
// Event handlers
let currentAccount, timer;

btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount);

  if (currentAccount?.pin === +inputLoginPin.value) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;

    //Create current date and time
    containerApp.style.opacity = 100;
    const now = new Date();
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'numeric', //can be 'long' -string
      year: 'numeric', // can also '2-digits'
      // weekday: 'numeric',
    };

    //easy way to get local info languege
    /*
    const locale = navigator.language;
    console.log(locale);
*/
    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now);
    /*
    const now = new Date();
    const day = `${now.getDate()}`.padStart(2, 0);
    const month = `${now.getMonth() + 1}`.padStart(2, 0);
    const year = now.getFullYear();
    const hour = `${now.getHours()}`.padStart(2, 0);
    const min = `${now.getMinutes()}`.padStart(2, 0);

    labelDate.textContent = `${day}/${month}/${year}, ${hour}:${min}`;
    */
    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    //Timer
    if (timer) clearInterval(timer);
    timer = startLogOutTimer();

    // Update UI
    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    //add transfer date
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());
    // Update UI
    updateUI(currentAccount);
  }
  //Reset the timer
  clearInterval(timer);
  timer = startLogOutTimer();
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    // Add movement
    setTimeout(function () {
      currentAccount.movements.push(amount);

      //add loan date
      currentAccount.movementsDates.push(new Date().toISOString());

      // Update UI
      updateUI(currentAccount);
      //Reset the timer
      clearInterval(timer);
      timer = startLogOutTimer();
    }, 2500);
  }
  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    +inputClosePin.value === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    console.log(index);
    // .indexOf(23)

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

/* ~~~~~~~~~ Numbers -some methods~~~~~~~~
 
//in js numbers allways decimal.
console.log(23 === 23.0); //true

console.log(0.1 + 0.2); //0.30000000004
console.log(0.1 + 0.2 === 0.3); //false- js bug we must accapt

//~~~converting Strings to objects

//instead of:
console.log(Number('23'));
//we can do that:
console.log(+'23');

//parsing (second args go for Base number(binary,10..))
console.log(Number.parseInt('30px', 10));
console.log(Number.parseInt('e23', 10));
console.log(Number.parseInt('110', 2));
console.log(Number.parseFloat('2.5rem'));
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

//check if Nan(not a number type)
console.log(Number.isNaN(20));
console.log(Number.isNaN('20'));
console.log(Number.isNaN(+'20x'));
//check if nubmer is finite
console.log(Number.isFinite(20));
console.log(Number.isFinite(4 / 0));

//check if integer
console.log(Number.isInteger(20));
console.log(Number.isInteger(20.4));




/* ~~~~~~~~~ Numbers -Math and rounding~~~~~~~~
 

//sqrt func
console.log(Math.sqrt(25));
console.log(25 ** (1 / 2)); //like 293..
console.log(8 ** (1 / 3));

//max method - returns max number
console.log(Math.max(5, 18, 23, 11, 2)); //23
console.log(Math.max(5, 18, '23', 11, 2)); //23
console.log(Math.max(5, 18, '23px', 11, 2)); //NaN

//min method - returns min number
console.log(Math.min(5, 18, 23, 11, 2)); //2

//math.random &&math.trunc
//trunc - gives only integer
//random gives number between 0-1 (if trunc so 1)
console.log(Math.trunc(Math.random() * 6) + 1); // random between 0-6.

//creating range random
const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min) + 1) + min;
//0...1 -> 0..(max-min) -> min...max
console.log(randomInt(10, 20));

//Rounding numbers
console.log(Math.trunc(23.3)); //23

console.log(Math.round(23.2)); //23
console.log(Math.round(23.9)); //24

console.log(Math.ceil(23.3)); //24
console.log(Math.ceil(23.7)); //24

//better than trunc becuz better with negative nums
console.log(Math.floor(23.3)); //23
console.log(Math.floor(23.9)); //23

//Rounding decimals

//to fixed - fixes the number by chosen arg (how much numbers after dot),
//rounds the number and returns as a string
console.log((2.7).toFixed(0)); //3
console.log((2.7).toFixed(3)); //2.700
console.log((2.345).toFixed(2)); //2.35
console.log(+(2.345).toFixed(2)); //2.35 (number)



/* ~~~~~~~~~ Using reminder (%) operator~~~~~~~~
 

console.log(5 % 2); //1
console.log(5 / 2); //5=2*2+1

const isEven = n => n % 2 === 0;
console.log(isEven(8)); //true
console.log(isEven(7)); //flse

labelBalance.addEventListener('click', function () {
  [...document.querySelectorAll('.movements__row')].forEach(function (row, i) {
    if (i % 2 === 0) row.style.backgroundColor = 'orangered';
  });
});


/* ~~~~~~~~~ Big INTS~~~~~~~~
 

//the highest represented integer
console.log(Number.MAX_SAFE_INTEGER);

//for declaring big int just put 'n' in the end
console.log(124579654345678098765433478n);
//or this (but not big as 'n' can represent)
console.log(BigInt(482943535305));

//Operations
console.log(10000n + 10000n);
console.log(4546754747547547n * 235460n);

const huge = 254678987654345678n;
const num = 23;
console.log(huge * Bigint(num)); //have to convert num to big int
//exceptions
console.log(20n > 15); //true

console.log(20n === 20); //false!!
console.log(20n == 20); //true!!

console.log(huge + ' is REALLY big!!!');

//divisions
console.log(11n / 3n); //3n


/* ~~~~~~~~~ Dates And Time~~~~~~~~
 

//Create a Date

const now = new Date();
console.log(now);
console.log(new Date('December 24,2015'));
console.log(new Date(account1.movementsDates[0]));
console.log(new Date(2037, 10, 19, 15, 23, 5)); // y-m-d-hour-minute-sec
console.log(new Date(0));
console.log(new Date(3 * 24 * 60 * 60 * 1000));

//Working with dates
const future = new Date(2037, 10, 19, 15, 23);
console.log(future);
console.log(future.getFullYear());
console.log(future.getMonth());
console.log(future.getDate());
console.log(future.getDay());
console.log(future.getHours());
console.log(future.getMinutes());
console.log(future.getSeconds());
//very usefull method to convert time to string
console.log(future.toISOString());
//time that has passed since january 1 1970
console.log(future.getTime());

//current timestamp
console.log(Date.now());


/* ~~~~~~~~~ Operations with Dates~~~~~~~~

const future = new Date(2037, 10, 19, 15, 23);
console.log(+future); //gives the time in millisecond
//we can see here the convertion from milliseconds to days
const calcDaysPassed = (date1, date2) =>
  Math.abs(date2 - date1) / (1000 * 60 * 60 * 24);

const days1 = calcDaysPassed(new Date(2037, 3, 14), new Date(2037, 3, 24));
console.log(days1); //10 days between


/* ~~~~~~~~~ Internationalizing Numbers(intl)~~~~~~~~

const num = 3884764.23;

//we can check alot of propreties
const options = {
  style: 'currency', //percent , unit
  unit: 'mile-per-hour', //celsius
  currency: 'EUR',
  //useGrouping: false,
};

console.log('US:      ', new Intl.NumberFormat('en-US', options).format(num));
console.log('Germany: ', new Intl.NumberFormat('de-DE', options).format(num));
console.log('Syria:   ', new Intl.NumberFormat('ar-SY', options).format(num));
console.log('Israel:  ', new Intl.NumberFormat('he', options).format(num));

console.log(
  navigator.language,
  new Intl.NumberFormat(navigator.language).format(num)
);


/* ~~~~~~~~~ Timers : Timeout and sentinterval~~~~~~~~
timeout - set timer that runs time backwars till 0 
setinerval - set timer that executes every time setten(counting and exe)


//SetTimeout

const ingerdients = ['olives ', 'spinach'];
//notice how we pass the args in setTimeout!
const pizzaTimer = setTimeout(
  (ing1, ing2) => console.log(`Here is your pizza with ${ing1} and ${ing2}`),
  5000,
  ...ingerdients
); //prints after 5 sec
console.log('Waiting...'); //runs regullary!

//cancel the timer! in timeout
if (ingerdients.includes('spinach')) {
  clearTimeout(pizzaTimer); //clearing the timeout and not printing!
  console.log('eww spinach.. Order has Cancelled');
}

//setIntervals

//prints clock!
setInterval(function () {
  const now = new Date();
  const hour = `${now.getHours()}`.padStart(2, 0);
  const min = `${now.getMinutes()}`.padStart(2, 0);
  const second = `${now.getSeconds()}`.padStart(2, 0);
  console.log(`${hour}:${min}:${second}`);
}, 1000);
*/
