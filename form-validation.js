/**
 * Form Validation and Submission Handler
 * Provides proper validation, error handling, and user feedback
 */

class FormHandler {
    constructor(formElement, options = {}) {
        this.form = formElement;
        this.submitButton = this.form.querySelector('button[type="submit"]');
        this.originalButtonText = this.submitButton ? this.submitButton.innerHTML : 'Submit';
        this.options = {
            showToast: true,
            validateOnBlur: true,
            scrollToError: true,
            ...options
        };
        
        this.init();
    }

    init() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        if (this.options.validateOnBlur) {
            this.form.querySelectorAll('input, textarea, select').forEach(field => {
                field.addEventListener('blur', () => this.validateField(field));
                field.addEventListener('input', () => this.clearError(field));
            });
        }
    }

    validateField(field) {
        const errors = [];
        const value = field.value.trim();
        const type = field.type;
        const required = field.hasAttribute('required');
        const minLength = field.getAttribute('minlength');
        const maxLength = field.getAttribute('maxlength');
        const pattern = field.getAttribute('pattern');
        
        // Required field validation
        if (required && !value) {
            errors.push(`${this.getFieldLabel(field)} is required`);
        }
        
        // Email validation
        if (type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                errors.push('Please enter a valid email address');
            }
        }
        
        // Phone validation
        if (type === 'tel' && value) {
            const phoneRegex = /^[\d\s\-\+\(\)]+$/;
            if (!phoneRegex.test(value) || value.replace(/\D/g, '').length < 10) {
                errors.push('Please enter a valid phone number');
            }
        }
        
        // Length validation
        if (minLength && value.length < parseInt(minLength)) {
            errors.push(`Minimum ${minLength} characters required`);
        }
        
        if (maxLength && value.length > parseInt(maxLength)) {
            errors.push(`Maximum ${maxLength} characters allowed`);
        }
        
        // Pattern validation
        if (pattern && value) {
            const regex = new RegExp(pattern);
            if (!regex.test(value)) {
                errors.push(field.getAttribute('data-pattern-error') || 'Invalid format');
            }
        }
        
        // Custom validation
        if (field.dataset.validate) {
            const customErrors = this.customValidation(field, value);
            errors.push(...customErrors);
        }
        
        // Display errors
        if (errors.length > 0) {
            this.showError(field, errors[0]);
            return false;
        } else {
            this.clearError(field);
            return true;
        }
    }

    customValidation(field, value) {
        const errors = [];
        const validateType = field.dataset.validate;
        
        switch (validateType) {
            case 'age':
                const age = parseInt(value);
                if (age < 18) errors.push('Must be 18 or older');
                if (age > 120) errors.push('Please enter a valid age');
                break;
            
            case 'zip':
                if (!/^\d{5}(-\d{4})?$/.test(value)) {
                    errors.push('Please enter a valid ZIP code');
                }
                break;
            
            case 'ssn':
                if (!/^\d{3}-?\d{2}-?\d{4}$/.test(value)) {
                    errors.push('Please enter a valid SSN (XXX-XX-XXXX)');
                }
                break;
        }
        
        return errors;
    }

    showError(field, message) {
        // Add error class to field
        field.classList.add('error');
        
        // Find or create error element
        let errorElement = field.parentElement.querySelector('.form-error');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'form-error';
            field.parentElement.appendChild(errorElement);
        }
        
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        
        // Add ARIA attributes for accessibility
        field.setAttribute('aria-invalid', 'true');
        field.setAttribute('aria-describedby', errorElement.id || this.generateId());
        if (!errorElement.id) {
            errorElement.id = field.getAttribute('aria-describedby');
        }
    }

    clearError(field) {
        field.classList.remove('error');
        field.removeAttribute('aria-invalid');
        field.removeAttribute('aria-describedby');
        
        const errorElement = field.parentElement.querySelector('.form-error');
        if (errorElement) {
            errorElement.style.display = 'none';
        }
    }

    getFieldLabel(field) {
        const label = field.parentElement.querySelector('label');
        if (label) return label.textContent.replace('*', '').trim();
        
        return field.placeholder || field.name || 'This field';
    }

    generateId() {
        return 'error-' + Math.random().toString(36).substr(2, 9);
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        // Validate all fields
        const fields = this.form.querySelectorAll('input, textarea, select');
        let isValid = true;
        let firstErrorField = null;
        
        fields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
                if (!firstErrorField) firstErrorField = field;
            }
        });
        
        // Scroll to first error
        if (!isValid) {
            if (this.options.scrollToError && firstErrorField) {
                firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
                firstErrorField.focus();
            }
            
            if (this.options.showToast && window.Toast) {
                window.Toast.error('Please fix the errors in the form');
            }
            return;
        }
        
        // Show loading state
        this.setLoadingState(true);
        
        // Prepare form data
        const formData = new FormData(this.form);
        const data = Object.fromEntries(formData);
        
        // Add form type if specified
        if (this.form.dataset.formType) {
            data.formType = this.form.dataset.formType;
        }
        
        try {
            const response = await fetch('/api/submit-form', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.handleSuccess(result.message);
            } else {
                throw new Error(result.error || 'Submission failed');
            }
        } catch (error) {
            this.handleError(error);
        } finally {
            this.setLoadingState(false);
        }
    }

    setLoadingState(loading) {
        if (!this.submitButton) return;
        
        if (loading) {
            this.submitButton.disabled = true;
            this.submitButton.innerHTML = `
                <svg class="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
            `;
            this.form.classList.add('loading');
        } else {
            this.submitButton.disabled = false;
            this.submitButton.innerHTML = this.originalButtonText;
            this.form.classList.remove('loading');
        }
    }

    handleSuccess(message) {
        // Show success message
        if (this.options.showToast && window.Toast) {
            window.Toast.success(message || 'Form submitted successfully!');
        }
        
        // Reset form
        this.form.reset();
        
        // Clear all errors
        this.form.querySelectorAll('.error').forEach(field => {
            this.clearError(field);
        });
        
        // Trigger custom success event
        this.form.dispatchEvent(new CustomEvent('formSuccess', { 
            detail: { message } 
        }));
        
        // Optional: Redirect after success
        if (this.form.dataset.successUrl) {
            setTimeout(() => {
                window.location.href = this.form.dataset.successUrl;
            }, 2000);
        }
    }

    handleError(error) {
        console.error('Form submission error:', error);
        
        const message = error.message || 'There was an error submitting the form. Please try again.';
        
        if (this.options.showToast && window.Toast) {
            window.Toast.error(message);
        }
        
        // Trigger custom error event
        this.form.dispatchEvent(new CustomEvent('formError', { 
            detail: { error: message } 
        }));
    }
}

// Auto-initialize forms with data-validate attribute
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('form[data-validate]').forEach(form => {
        new FormHandler(form);
    });
});

// Make available globally
window.FormHandler = FormHandler;