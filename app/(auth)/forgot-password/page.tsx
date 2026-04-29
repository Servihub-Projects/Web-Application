import type { Metadata } from 'next';
import ForgotPasswordForm from "./forgot-password";
export const metadata: Metadata = { title: "Forgot Password" };
export default function ForgotPassword() {
  return <ForgotPasswordForm />
}
