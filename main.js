const appForm = document.getElementById("appForm");
const completeState = document.getElementById("completeState");

const card = {
	name: document.getElementById("cardHolderName"),
	number: document.getElementById("cardNumber"),
	month: document.getElementById("cardMonth"),
	year: document.getElementById("cardYear"),
};

const form = {
	name: document.getElementById("cardNameInput"),
	number: document.getElementById("cardNumberInput"),
	month: document.getElementById("monthInput"),
	year: document.getElementById("yearInput"),
	cvc: document.getElementById("cvcInput"),
};

const errors = {
	name: document.getElementById("cardNameErr"),
	number: document.getElementById("cardNumberErr"),
	exp: document.getElementById("expErr"),
	cvc: document.getElementById("cvcErr"),
};

// Error helpers
function setError(field, message) {
	if (field === "exp") {
		form.month.classList.add("error");
		form.year.classList.add("error");
		errors.exp.style.display = "block";
		errors.exp.textContent = message;
	} else {
		form[field].classList.add("error");
		errors[field].style.display = "block";
		errors[field].textContent = message;
	}
}

function clearError(field) {
	if (field === "exp") {
		form.month.classList.remove("error");
		form.year.classList.remove("error");
		errors.exp.style.display = "none";
	} else {
		form[field].classList.remove("error");
		errors[field].style.display = "none";
	}
}

// Validation rules
const rules = {
	name: {
		required: "Can't be blank",
		maxLength: { value: 20, message: "Too long" },
		pattern: { regex: /^[A-Za-z]+\s[A-Za-z]+$/, message: "Wrong format" },
		updateCard: (v) => (card.name.textContent = v),
	},
	number: {
		required: "Can't be blank",
		pattern: {
			regex: /^\d{4}\s\d{4}\s\d{4}\s\d{4}$/,
			message: "Wrong format, 16 digits required",
		},
		updateCard: (v) => (card.number.textContent = v),
	},
	cvc: {
		required: "Can't be blank",
		pattern: { regex: /^\d{3}$/, message: "Must be 3 digits" },
	},
};

// Basic validators
function validateField(field, value) {
	const rule = rules[field];
	value = value.trim();
	if (!value) return rule.required;
	if (rule.maxLength && value.length > rule.maxLength.value)
		return rule.maxLength.message;
	if (rule.pattern && !rule.pattern.regex.test(value))
		return rule.pattern.message;
	return null;
}

function validateExpiration(month, year) {
	month = month.trim();
	year = year.trim();

	if (!month || !year) return "Can't be blank";
	if (!/^(0[1-9]|1[0-2])$/.test(month)) return "Invalid month";
	if (!/^\d{2}$/.test(year)) return "Invalid year";

	const currentYear = new Date().getFullYear() % 100; // e.g. 25
	const currentMonth = new Date().getMonth() + 1;

	if (
		parseInt(year) < currentYear ||
		(parseInt(year) === currentYear && parseInt(month) < currentMonth)
	)
		return "Card expired";

	return null;
}

// Submit handler
appForm.addEventListener("submit", (e) => {
	e.preventDefault();
	let hasError = false;

	// Validate name, number, cvc
	["name", "number", "cvc"].forEach((field) => {
		const value = form[field].value;
		const errorMsg = validateField(field, value);
		if (errorMsg) {
			setError(field, errorMsg);
			hasError = true;
		} else {
			clearError(field);
			if (rules[field].updateCard) rules[field].updateCard(value);
		}
	});

	// Validate expiration (shared)
	const expErr = validateExpiration(form.month.value, form.year.value);
	if (expErr) {
		setError("exp", expErr);
		hasError = true;
	} else {
		clearError("exp");
		card.month.textContent = form.month.value;
		card.year.textContent = form.year.value;
	}

	if (!hasError) {
		appForm.style.display = "none";
		completeState.style.display = "flex";
	} else {
		completeState.style.display = "none";
	}
});

// Real-time validation
Object.keys(form).forEach((field) => {
	form[field].addEventListener("input", (e) => {
		const value = e.target.value.trim();

		// auto-format card number
		if (field === "number") {
			e.target.value = value
				.replace(/\D/g, "")
				.replace(/(.{4})/g, "$1 ")
				.trim();
		}

		if (field === "month" || field === "year") {
			const expErr = validateExpiration(form.month.value, form.year.value);
			if (expErr) {
				setError("exp", expErr);
			} else {
				clearError("exp");
				card.month.textContent = form.month.value;
				card.year.textContent = form.year.value;
			}
			return;
		}

		const errorMsg = validateField(field, e.target.value);
		if (errorMsg) {
			setError(field, errorMsg);
		} else {
			clearError(field);
			if (rules[field].updateCard) rules[field].updateCard(e.target.value);
		}
	});
});

// Reset state after success
document.getElementById("completeStateBtn").addEventListener("click", () => {
	appForm.reset();
	appForm.style.display = "flex";
	completeState.style.display = "none";

	// Reset card preview
	card.name.textContent = "Jane Appleseed";
	card.number.textContent = "0000 0000 0000 0000";
	card.month.textContent = "00";
	card.year.textContent = "00";
});
