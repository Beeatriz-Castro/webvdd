import { API_BASE_URL } from "./api";

export interface RegisterPayload {
  email: string;
  senha: string;
  confirmarSenha: string;
  nome: string;
  cpf: string;
}

export interface LoginPayload {
  email: string;
  senha: string;
}

export interface LoginResponse {
  accessToken: string;
  user: {
    id: number;
    email: string;
    role: string;
  };
}

export interface AuthMessageResponse {
  message: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  novaSenha: string;
}

export async function forgotPassword(data: ForgotPasswordPayload): Promise<AuthMessageResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Erro ao solicitar recuperação de palavra-passe.");
  }

  return response.json();
}

export async function resetPassword(data: ResetPasswordPayload): Promise<AuthMessageResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Erro ao redefinir a palavra-passe.");
  }

  return response.json();
}

export async function register(
  data: RegisterPayload
): Promise<AuthMessageResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw {
      status: response.status,
      message: error.message || "Erro ao cadastrar.",
    };
  }

  return response.json();
}

export async function login(data: LoginPayload): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw {
      status: response.status,
      message: error.message || "Erro ao realizar login.",
    };
  }

  return response.json();
}

export async function verifyEmail(
  token: string
): Promise<AuthMessageResponse> {
  const response = await fetch(
    `${API_BASE_URL}/auth/verify-email?token=${encodeURIComponent(token)}`
  );

  if (!response.ok) {
    const error = await response.json();
    throw {
      status: response.status,
      message: error.message || "Erro ao verificar e-mail.",
    };
  }

  return response.json();
}

export async function logout(accessToken: string): Promise<void> {
  await fetch(`${API_BASE_URL}/auth/logout`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}
