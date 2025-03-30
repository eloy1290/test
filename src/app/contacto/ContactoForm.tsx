'use client';

import { useState } from 'react';
import { FiSend } from 'react-icons/fi';
import ReCaptcha from '@/components/ui/ReCaptcha';

export default function ContactoForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!recaptchaToken) {
      alert('Por favor, verifica que no eres un robot.');
      return;
    }

    setSubmitStatus('loading');
    
    try {
      // Aquí iría la lógica para enviar el formulario
      // Por ejemplo, una llamada a tu API
      // const response = await fetch('/api/contact', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ ...formData, recaptchaToken }),
      // });
      
      // if (!response.ok) throw new Error('Error al enviar el mensaje');
      
      // Simulamos una respuesta exitosa
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSubmitStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setRecaptchaToken(null);
    } catch (error) {
      console.error('Error al enviar el formulario:', error);
      setSubmitStatus('error');
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Nombre
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          placeholder="Tu nombre"
          required
        />
      </div>
      
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          placeholder="tu@email.com"
          required
        />
      </div>
      
      <div>
        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
          Asunto
        </label>
        <input
          type="text"
          id="subject"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          placeholder="Asunto del mensaje"
          required
        />
      </div>
      
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
          Mensaje
        </label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          placeholder="Escribe tu mensaje aquí..."
          required
        ></textarea>
      </div>
      
      {/* ReCaptcha */}
      <ReCaptcha onVerify={setRecaptchaToken} />
      
      {submitStatus === 'success' && (
        <div className="p-3 bg-green-100 text-green-700 rounded-md">
          Mensaje enviado correctamente. ¡Gracias por contactarnos!
        </div>
      )}
      
      {submitStatus === 'error' && (
        <div className="p-3 bg-red-100 text-red-700 rounded-md">
          Ha ocurrido un error al enviar el mensaje. Por favor, inténtalo de nuevo.
        </div>
      )}
      
      <div className="flex justify-end">
        <button
          type="submit"
          className="btn-primary flex items-center"
          disabled={submitStatus === 'loading'}
        >
          {submitStatus === 'loading' ? 'Enviando...' : 'Enviar mensaje'}
          <FiSend className="ml-2" />
        </button>
      </div>
    </form>
  );
}