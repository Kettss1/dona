interface LoginResponse {
  ok: boolean;
  message?: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

export async function mockLogin(data: LoginRequest): Promise<LoginResponse> {
  await new Promise((resolve) => setTimeout(resolve, 800));

  if (!data.email || !data.password) {
    return { ok: false, message: 'Please fill in all fields.' };
  }

  if (!data.email.includes('@')) {
    return { ok: false, message: 'Please enter a valid email.' };
  }

  if (data.password.length < 6) {
    return { ok: false, message: 'Password must be at least 6 characters.' };
  }

  return { ok: true };
}
