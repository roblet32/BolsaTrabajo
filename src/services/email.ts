export interface SendEmailParams {
  toEmail: string;
  toName: string;
  subject: string;
  body: string;
}

export const isEmailConfigured = (): boolean => {
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID || '';
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '';
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '';
  return serviceId.length > 0 && templateId.length > 0 && publicKey.length > 0;
};

export const sendEmailBackground = async (params: SendEmailParams): Promise<boolean> => {
  if (!isEmailConfigured()) {
    console.warn('EmailJS no está configurado en las variables de entorno.');
    return false;
  }

  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

  try {
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service_id: serviceId,
        template_id: templateId,
        user_id: publicKey,
        template_params: {
          to_email: params.toEmail,
          to_name: params.toName,
          subject: params.subject,
          message: params.body,
          from_name: 'Bolsa de Trabajo Jalpan',
        },
      }),
    });

    if (response.ok) {
      console.log('Correo enviado con éxito a través de EmailJS');
      return true;
    } else {
      const errorText = await response.text();
      console.error('Error al enviar correo vía EmailJS:', errorText);
      return false;
    }
  } catch (error) {
    console.error('Error de red al enviar correo vía EmailJS:', error);
    return false;
  }
};
