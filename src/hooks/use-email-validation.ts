import { useUser } from '@clerk/clerk-react';
import { useState, useEffect } from 'react';

export function useEmailValidation() {
  const { user, isLoaded } = useUser();
  const [isValidEmail, setIsValidEmail] = useState(true); // Estado inicial verdadero
  const [email, setEmail] = useState<string>('');

  useEffect(() => {
    if (isLoaded && user) {
      const userEmail = user.primaryEmailAddress?.emailAddress || '';
      setEmail(userEmail);
      const isUdpEmail = userEmail.endsWith('@mail.udp.cl');
      setIsValidEmail(isUdpEmail);
    } else if (isLoaded && !user) {
      // Usuario no autenticado - establecer como válido para mostrar SignInButton
      setIsValidEmail(true);
    }
  }, [isLoaded, user]);

  return {
    isValidEmail,
    email,
    isLoaded,
    user,
    isSignedIn: !!user
  };
}
