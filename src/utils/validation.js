export const validateRegisterData = (formData) => {
    const errors = {};

    if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Las contraseñas no coinciden';
    }
    if (formData.telefono !== formData.confirmTelefono) {
        errors.confirmTelefono = 'Los números de teléfono no coinciden';
    }
    
    // Puedes agregar más validaciones según sea necesario
    return errors;
};

export const validateLoginData = (formData) => {
    const errors = {};

    if (!formData.email) {
        errors.email = 'El correo es obligatorio';
    }
    if (!formData.password) {
        errors.password = 'La contraseña es obligatoria';
    }
    
    return errors;
};