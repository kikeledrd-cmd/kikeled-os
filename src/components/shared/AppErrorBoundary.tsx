import { Component, type ErrorInfo, type ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

type State = {
  error: Error | null;
};

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Kikeled OS render error', error, info);
  }

  render() {
    if (!this.state.error) {
      return this.props.children;
    }

    return (
      <div className="min-h-screen bg-ink px-4 py-10 text-white sm:px-6">
        <div className="mx-auto max-w-3xl rounded-[1.5rem] border border-rose/40 bg-rose/10 p-6">
          <p className="label mb-3 text-rose">Error visible</p>
          <h1 className="text-3xl font-semibold">Esta pantalla no pudo cargar.</h1>
          <p className="mt-4 text-sm leading-7 text-soft">
            La app capturo un error de render para evitar una pantalla en blanco. Recarga la pagina y revisa el modulo afectado antes de continuar.
          </p>
          <pre className="mt-5 overflow-auto rounded-2xl border border-white/10 bg-black/40 p-4 text-sm text-rose-100">
            {this.state.error.message}
          </pre>
        </div>
      </div>
    );
  }
}
