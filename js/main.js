// AUTHOR: KAMRON FOZILOV
// DATE: 2023-10-08

// ** VARIABLES **
const THEME_SWITCHER_CONTROL = document.querySelector(
	'.theme-switcher__control-wrapper'
)
const CALCULATOR_KEYBOARD = document.querySelector('.calculator__keyboard')
const CALCULATOR_INPUT = document.querySelector('.calculator__input')

let IS_SOUND_ENABLED = true

// ** FUNCTIONS **
// ?SWITCH THEME
function switchTheme() {
	const rootElement = document.documentElement
	const selectedTheme =
		THEME_SWITCHER_CONTROL.querySelector('input:checked').value
	let newTheme = ''

	if (selectedTheme === 'light') {
		newTheme = 'light'
	} else if (selectedTheme === 'dark') {
		newTheme = 'dark'
	} else if (selectedTheme === 'vintage') {
		newTheme = 'vintage'
	}

	rootElement.setAttribute('data-theme', newTheme)
	localStorage.setItem('theme', newTheme)
}
// ?INITIALIZE
function initialize() {
	if (THEME_SWITCHER_CONTROL) {
		THEME_SWITCHER_CONTROL.addEventListener('change', switchTheme)
	}

	const currentTheme = document.documentElement.dataset.theme
	document
		.querySelector(`.theme-switcher__radio[value='${currentTheme}']`)
		.setAttribute('checked', true)
}
// ?RESET
function reset() {
	CALCULATOR_INPUT.value = ''
	calculator.currentValue = ''
	calculator.firstNumber = 0
	calculator.secondNumber = 0
	calculator.result = 0
}
// ?CLEAR INPUT
function clearInput(inputElement) {
	inputElement.value = ''
	reset()
}
// ?UPDATE INPUT
function updateInput(inputElement) {
	const value = parseFloat(calculator.currentValue, 10)
	inputElement.value = isNaN(value)
		? '0'
		: value.toLocaleString({ minimumIntegerDigits: 0 })
}
// ?HANDLE DELETE
function handleDelete() {
	calculator.currentValue = calculator.currentValue.slice(0, -1)
	updateInput(CALCULATOR_INPUT)
	if (calculator.currentValue === '') {
		reset()
	}
}
// ?SET OPERATOR
function setOperator(operator) {
	return function () {
		calculator.firstNumber = parseFloat(calculator.currentValue, 10)
		calculator.operator = operator
		calculator.currentValue = ''
	}
}
// ?PLAY KEY PRESS SOUND
function playKeyPressSound() {
	if (IS_SOUND_ENABLED) {
		const audio = new Audio('media/cherry.wav')
		audio.play()

		const duration = 300
		setTimeout(function () {
			audio.pause()
			audio.currentTime = 0
		}, duration)
	}
}
// ?EMULATE KEY PRESS
function emulateKeyPress({ key, altKey }) {
	const keyElement = document.querySelector(`.key[data-key="${key}"]`)
	if (keyElement && !altKey) {
		keyElement.focus()
		keyElement.classList.add('active')
		setTimeout(function () {
			keyElement.blur()
			keyElement.classList.remove('active')
		}, 100)
		playKeyPressSound()
	}
}

// ** EVENTS **
document.addEventListener('DOMContentLoaded', initialize)

// ?CALCULATOR KEYDOWN
document.addEventListener('keydown', function (evt) {
	emulateKeyPress({ key: evt.key, altKey: evt.altKey })

	const isNotAllowedKey =
		!calculator.keys.numbers.includes(evt.key) &&
		!calculator.keys.operators.includes(evt.key) &&
		!calculator.keys.commands.includes(evt.key)

	if (isNotAllowedKey) {
		evt.preventDefault()
	}

	if (evt.key === 'Enter') {
		evt.preventDefault()
		const equalButton = document.querySelector('.key--equal')
		if (equalButton) {
			equalButton.click()
		}
	}

	if (evt.key === 'Escape') {
		clearInput(CALCULATOR_INPUT)
	}

	if (evt.key === 'Delete' || evt.key === 'Backspace') {
		evt.preventDefault()
		handleDelete()
	}

	if (evt.altKey && (evt.key === '1' || evt.key === '2' || evt.key === '3')) {
		let themeValue = ''

		if (evt.key === '1') {
			themeValue = 'dark'
		} else if (evt.key === '2') {
			themeValue = 'light'
		} else if (evt.key === '3') {
			themeValue = 'vintage'
		}

		const themeInput = document.querySelector(
			`.theme-switcher__radio[value='${themeValue}']`
		)

		if (themeInput) {
			themeInput.checked = true
			switchTheme()
		}
	}

	const isNumberKey = calculator.keys.numbers.includes(evt.key)
	if (isNumberKey && !evt.altKey) {
		evt.preventDefault()
		calculator.currentValue += evt.key
		updateInput(CALCULATOR_INPUT)
	}

	const isOperatorKey = calculator.keys.operators.includes(evt.key)
	if (isOperatorKey && !evt.altKey) {
		evt.preventDefault()
		setOperator(evt.key)()
	}
})

// ?CALCULATOR KEYBOARD
if (CALCULATOR_KEYBOARD) {
	CALCULATOR_KEYBOARD.addEventListener('click', function (evt) {
		playKeyPressSound()
		const isNotANumberKey = !evt.target.classList.contains('key--number')
		const isDecimalKey = evt.target.dataset.key === '.'

		if (isNotANumberKey) {
			return
		}

		if (isDecimalKey && calculator.currentValue.includes('.')) {
			return
		}

		calculator.currentValue += evt.target.dataset.key
		updateInput(CALCULATOR_INPUT)
	})

	// RESET BUTTON
	const resetButton = document.querySelector('.key--reset')
	if (resetButton) {
		resetButton.addEventListener('click', function () {
			clearInput(CALCULATOR_INPUT)
		})
	}

	// DELETE BUTTON
	const deleteButton = document.querySelector('.key--del')
	if (deleteButton) {
		deleteButton.addEventListener('click', function () {
			handleDelete()
		})
	}

	// OPERATOR BUTTONS (+, -, *, /)
	const operatorButtons = document.querySelectorAll('.key--operator')
	if (operatorButtons) {
		operatorButtons.forEach(button => {
			const operator = button.dataset.key
			button.addEventListener('click', () => setOperator(operator)()) // Adapt the function call to pass the operator as an argument
		})
	}

	// EQUAL BUTTON
	const equalButton = document.querySelector('.key--equal')
	if (equalButton) {
		equalButton.addEventListener('click', function () {
			calculator.secondNumber = parseFloat(calculator.currentValue, 10)

			if (calculator.operator === '+') {
				calculator.result = calculator.firstNumber + calculator.secondNumber
			} else if (calculator.operator === '-') {
				calculator.result = calculator.firstNumber - calculator.secondNumber
			} else if (calculator.operator === '*') {
				calculator.result = calculator.firstNumber * calculator.secondNumber
			} else if (calculator.operator === '/') {
				calculator.result = calculator.firstNumber / calculator.secondNumber
			}

			if (calculator.operator !== '') {
				calculator.currentValue = calculator.result.toString()
				calculator.operator = ''
				updateInput(CALCULATOR_INPUT)
			}

			const resultValue = calculator.result.toString()
			navigator.clipboard.writeText(resultValue)
		})
	}
}

// !STATE
const calculator = {
	currentValue: '',
	firstNumber: 0,
	secondNumber: 0,
	operator: '',
	result: 0,
	keys: {
		numbers: ['.', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
		operators: ['+', '-', '*', '/'],
		commands: [
			'Escape',
			'Enter',
			'Tab',
			'Shift',
			'Control',
			'Alt',
			'Delete',
			'Backspace',
			'F5',
		],
	},
}
