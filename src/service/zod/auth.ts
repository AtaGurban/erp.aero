import { z } from "zod";
// Схема для id (email или телефон)
const idSchema = z.string().refine((value) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\+?[0-9]{10,15}$/; // поддержка +7, +998 и пр.

  return emailRegex.test(value) || phoneRegex.test(value);
}, {
  message: 'ID должен быть валидным email или номером телефона',
});

// Схема для password
const passwordSchema = z.string()
  .min(6, { message: 'Пароль должен быть не менее 6 символов' });


export const authSchema = z.object({
  id: idSchema,
  password: passwordSchema,
});

export type LoginOrRegistrationBody = z.infer<typeof authSchema>;
