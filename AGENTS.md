# Development conventions

- Do not use `FormEvent<HTMLFormElement>` in React components; it is deprecated. Use `SubmitEvent<HTMLFormElement>` for form submit handlers instead.
- Split large, complex React components and pages into a view component and a custom hook that encapsulates their behaviour, state, and side effects.
- Use configured path aliases for all imports; do not use relative import paths.
- When writing tests, name test cases using the Given-When-Then pattern (e.g., `given [precondition], when [action], then [expected outcome]`).
