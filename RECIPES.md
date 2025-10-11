<div align="center">
  <h1>🍳 Wretch Recipes</h1>
  <p><i>Common patterns and solutions for using Wretch, based on real-world use cases from the community.</i></p>
</div>

<br>

## 📋 Table of Contents

- [🔌 Framework Integration](#-framework-integration)
  - [SvelteKit](#sveltekit)
  - [Next.js](#nextjs)
- [⚠️ Error Handling](#️-error-handling)
  - [Parsing Error Response Bodies](#parsing-error-response-bodies)
  - [Custom Error Types](#custom-error-types)
  - [Global Error Handlers](#global-error-handlers)
- [📘 TypeScript Patterns](#-typescript-patterns)
  - [Typing Precomposed Wretch Objects](#typing-precomposed-wretch-objects)
  - [Reusable Catcher Functions](#reusable-catcher-functions)
- [📤 File Uploads & FormData](#-file-uploads--formdata)
  - [Upload Progress Tracking](#upload-progress-tracking)
  - [Multipart FormData with Files](#multipart-formdata-with-files)
- [🔍 Query Strings](#-query-strings)
  - [Filtering Undefined Values](#filtering-undefined-values)
- [🎛️ Request Control](#️-request-control)
  - [Combining Timeouts with Custom AbortControllers](#combining-timeouts-with-custom-abortcontrollers)
  - [Aborting on Global Errors](#aborting-on-global-errors)
- [🚀 Advanced Patterns](#-advanced-patterns)
  - [Token Refresh & Request Replay](#token-refresh--request-replay)
  - [Schema Validation](#schema-validation)
  - [Handling 202 Accepted Responses](#handling-202-accepted-responses)
- [🤝 Contributing](#-contributing)

<br>

## 🔌 Framework Integration

### SvelteKit

> 💡 **Related issues:** [#242](https://github.com/elbywan/wretch/issues/242)

SvelteKit provides a custom `fetch` function in server-side contexts that enables automatic cookie forwarding and other framework features. Use `.fetchPolyfill()` to integrate it with Wretch:

```ts
// src/routes/+page.server.ts
import wretch from 'wretch';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch }) => {
  const api = wretch('https://api.example.com')
    .fetchPolyfill(fetch);

  const data = await api.get('/data').json();

  return { data };
};
```

<details>
<summary><b>Why this works</b></summary>

- SvelteKit's `fetch` preserves cookies and headers from the original request
- Wretch uses it instead of the global `fetch`
- Works in both SSR and server-side load functions

</details>

### Next.js

> 💡 **Related issues:** [#227](https://github.com/elbywan/wretch/issues/227), [#252](https://github.com/elbywan/wretch/issues/252)

Next.js App Router provides an enhanced `fetch` with automatic request deduplication and caching. Use it with Wretch:

```ts
// app/page.tsx
import wretch from 'wretch';

export default async function Page() {
  const api = wretch('https://api.example.com')
    .fetchPolyfill(fetch);

  const data = await api.get('/data').json();

  return <div>{JSON.stringify(data)}</div>;
}
```

For Pages Router with `getServerSideProps`:

```ts
import wretch from 'wretch';
import type { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const api = wretch('https://api.example.com')
    .options({
      headers: {
        cookie: req.headers.cookie || '',
      },
    });

  const data = await api.get('/data').json();

  return { props: { data } };
};
```

<br>

---

<br>

## ⚠️ Error Handling

### Parsing Error Response Bodies

> 💡 **Related issues:** [#236](https://github.com/elbywan/wretch/issues/236)

APIs often return structured error information in the response body. Use `.customError()` to parse and expose it:

```ts
import wretch from 'wretch';

const api = wretch('https://api.example.com')
  .customError(async (error, response) => {
    let errorMessage = response.statusText;

    try {
      const body = await response.json();
      if (body.message) {
        errorMessage = body.message;
      } else if (body.error) {
        errorMessage = body.error;
      }
    } catch {
      const text = await response.text();
      if (text) errorMessage = text;
    }

    return new Error(errorMessage, { cause: error });
  });

try {
  await api.get('/users/999').json();
} catch (error) {
  console.error(error.message);
}
```

<details>
<summary><b>Advanced: Structured Error Objects</b></summary>

```ts
class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public errorCode?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const api = wretch('https://api.example.com')
  .customError(async (error, response) => {
    const body = await response.json().catch(() => ({}));

    return new ApiError(
      body.message || response.statusText,
      response.status,
      body.code,
      body.details
    );
  });

try {
  await api.post('/users').json({ email: 'invalid' });
} catch (error) {
  if (error instanceof ApiError) {
    console.log('Status:', error.statusCode);
    console.log('Error code:', error.errorCode);
    console.log('Details:', error.details);
  }
}
```

</details>

### Custom Error Types

> 💡 **Related issues:** [#241](https://github.com/elbywan/wretch/issues/241)

Replace the default `WretchError` with a custom error class:

```ts
import wretch from 'wretch';

class HttpError extends Error {
  constructor(
    public status: number,
    public url: string,
    public response: Response,
    message?: string
  ) {
    super(message || `HTTP ${status} error at ${url}`);
    this.name = 'HttpError';
  }
}

const api = wretch('https://api.example.com')
  .customError((error, response) => {
    return new HttpError(
      response.status,
      response.url,
      response,
      error.message
    );
  });

try {
  await api.get('/protected').json();
} catch (error) {
  if (error instanceof HttpError) {
    console.log('Failed request URL:', error.url);
    console.log('Response headers:', error.response.headers);
  }
}
```

### Global Error Handlers

> 💡 **Related issues:** [#250](https://github.com/elbywan/wretch/issues/250)

Set up consistent error handling across all requests:

```ts
import wretch from 'wretch';

const api = wretch('https://api.example.com')
  .resolve(chain => chain
    .unauthorized(async (error, req) => {
      console.log('Token expired, refreshing...');
      const newToken = await refreshToken();
      return req.auth(`Bearer ${newToken}`).fetch().json();
    })
    .forbidden(error => {
      console.error('Access denied');
      throw error;
    })
    .internalError(error => {
      console.error('Server error:', error.message);
      throw error;
    })
    .fetchError(error => {
      console.error('Network error:', error.message);
      throw error;
    })
  );

await api.get('/data').json();
```

<br>

---

<br>

## 📘 TypeScript Patterns

### Typing Precomposed Wretch Objects

> 💡 **Related issues:** [#239](https://github.com/elbywan/wretch/issues/239)

When creating a reusable Wretch instance, preserve proper types:

```ts
import wretch, { Wretch } from 'wretch';
import QueryStringAddon, { QueryStringAddon as QueryStringAddonType } from 'wretch/addons/queryString';
import FormDataAddon, { FormDataAddon as FormDataAddonType } from 'wretch/addons/formData';

type ApiClient = Wretch<
  unknown,
  unknown,
  undefined
> & QueryStringAddonType & FormDataAddonType;

const createApiClient = (baseUrl: string, token?: string): ApiClient => {
  let client = wretch(baseUrl)
    .addon(QueryStringAddon)
    .addon(FormDataAddon)
    .options({ credentials: 'include' });

  if (token) {
    client = client.auth(`Bearer ${token}`);
  }

  return client as ApiClient;
};

const api = createApiClient('https://api.example.com', 'token');
api.query({ limit: 10 }).get('/users').json();
```

### Reusable Catcher Functions

> 💡 **Related issues:** [#226](https://github.com/elbywan/wretch/issues/226)

Extract common error handling into reusable functions:

```ts
import type { WretchError, WretchResponseChain } from 'wretch';

type CatcherFunction = <T, S, E>(
  chain: WretchResponseChain<T, S, E>
) => WretchResponseChain<T, S, E>;

const withAuthRetry = (refreshToken: () => Promise<string>): CatcherFunction => {
  return (chain) => chain.unauthorized(async (error, req) => {
    const newToken = await refreshToken();
    localStorage.setItem('token', newToken);
    return req.auth(`Bearer ${newToken}`).fetch().json();
  });
};

const withNotFoundDefault = <T>(defaultValue: T): CatcherFunction => {
  return (chain) => chain.notFound(() => defaultValue);
};

const withLogging: CatcherFunction = (chain) => {
  return chain.fetchError(error => {
    console.error('Request failed:', error.message);
    throw error;
  });
};

const api = wretch('https://api.example.com')
  .resolve(chain =>
    withAuthRetry(refreshUserToken)(
      withNotFoundDefault(null)(
        withLogging(chain)
      )
    )
  );

const user = await api.get('/users/123').json();
```

<details>
<summary><b>Composing Multiple Catchers</b></summary>

```ts
const composeCatchers = (...catchers: CatcherFunction[]): CatcherFunction => {
  return (chain) => catchers.reduce((acc, catcher) => catcher(acc), chain);
};

const api = wretch('https://api.example.com')
  .resolve(
    composeCatchers(
      withAuthRetry(refreshUserToken),
      withNotFoundDefault(null),
      withLogging
    )
  );
```

</details>

<br>

---

<br>

## 📤 File Uploads & FormData

### Upload Progress Tracking

> 💡 **Related issues:** [#225](https://github.com/elbywan/wretch/issues/225)

Monitor upload progress using `XMLHttpRequest` with a custom fetch polyfill:

```ts
import wretch from 'wretch';

const uploadWithProgress = (
  url: string,
  file: File,
  onProgress: (percent: number) => void
): Promise<any> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const percentComplete = (e.loaded / e.total) * 100;
        onProgress(percentComplete);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText));
        } catch {
          resolve(xhr.responseText);
        }
      } else {
        reject(new Error(`Upload failed: ${xhr.status}`));
      }
    });

    xhr.addEventListener('error', () => reject(new Error('Upload failed')));

    xhr.open('POST', url);

    const formData = new FormData();
    formData.append('file', file);

    xhr.send(formData);
  });
};

async function handleUpload(file: File) {
  const result = await uploadWithProgress(
    'https://api.example.com/upload',
    file,
    (percent) => {
      console.log(`Upload progress: ${percent.toFixed(0)}%`);
    }
  );

  console.log('Upload complete:', result);
}
```

<details>
<summary><b>Alternative: Using Progress Addon for Downloads</b></summary>

```ts
import wretch from 'wretch';
import ProgressAddon from 'wretch/addons/progress';

const downloadWithProgress = async (url: string) => {
  const data = await wretch(url)
    .addon(ProgressAddon())
    .get()
    .progress((loaded, total) => {
      const percent = (loaded / total) * 100;
      console.log(`Downloaded: ${percent.toFixed(0)}%`);
    })
    .blob();

  return data;
};
```

</details>

### Multipart FormData with Files

> 💡 **Related issues:** [#231](https://github.com/elbywan/wretch/issues/231), [#220](https://github.com/elbywan/wretch/issues/220)

Send files and structured data together:

```ts
import wretch from 'wretch';
import FormDataAddon from 'wretch/addons/formData';

const api = wretch('https://api.example.com').addon(FormDataAddon);

const uploadUserProfile = async (
  userId: string,
  profileData: { name: string; bio: string },
  avatar: File
) => {
  const data = {
    userId,
    name: profileData.name,
    bio: profileData.bio,
    avatar,
  };

  return api.url('/users/profile').formData(data).post().json();
};

const result = await uploadUserProfile(
  '123',
  { name: 'John Doe', bio: 'Software developer' },
  avatarFile
);
```

<details>
<summary><b>Manual FormData Construction</b></summary>

```ts
const formData = new FormData();
formData.append('userId', '123');
formData.append('name', 'John Doe');
formData.append('bio', 'Software developer');
formData.append('avatar', avatarFile);

const result = await wretch('https://api.example.com/users/profile')
  .body(formData)
  .post()
  .json();
```

</details>

<br>

---

<br>

## 🔍 Query Strings

### Filtering Undefined Values

> 💡 **Related issues:** [#229](https://github.com/elbywan/wretch/issues/229), [#261](https://github.com/elbywan/wretch/issues/261)

Remove undefined query parameters before sending requests.

**Using the built-in parameter:**

```ts
import wretch from 'wretch';
import QueryStringAddon from 'wretch/addons/queryString';

const api = wretch('https://api.example.com').addon(QueryStringAddon);

const searchUsers = async (params: {
  name?: string;
  email?: string;
  role?: string;
}) => {
  return api
    .url('/users')
    .query(params, false, true) // third parameter omits undefined/null values
    .get()
    .json();
};

await searchUsers({ name: 'John', email: undefined, role: 'admin' });
// URL will be: /users?name=John&role=admin
```

**Alternative - manual filtering:**

```ts
const filterUndefined = <T extends Record<string, any>>(obj: T): Partial<T> => {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, value]) => value !== undefined)
  ) as Partial<T>;
};

const api = wretch('https://api.example.com').addon(QueryStringAddon);

const searchUsers = async (params: {
  name?: string;
  email?: string;
  role?: string;
}) => {
  return api
    .url('/users')
    .query(filterUndefined(params))
    .get()
    .json();
};

await searchUsers({ name: 'John', email: undefined, role: 'admin' });
```

<details>
<summary><b>Alternative: Middleware Approach</b></summary>

```ts
import wretch from 'wretch';
import type { Middleware } from 'wretch';

const filterQueryParams: Middleware = () => (next) => (url, opts) => {
  const urlObj = new URL(url);
  const params = new URLSearchParams(urlObj.search);

  for (const [key, value] of Array.from(params.entries())) {
    if (value === 'undefined' || value === 'null') {
      params.delete(key);
    }
  }

  urlObj.search = params.toString();
  return next(urlObj.toString(), opts);
};

const api = wretch('https://api.example.com').middlewares([
  filterQueryParams()
]);
```

</details>

<br>

---

<br>

## 🎛️ Request Control

### Combining Timeouts with Custom AbortControllers

> 💡 **Related issues:** [#256](https://github.com/elbywan/wretch/issues/256), [#259](https://github.com/elbywan/wretch/issues/259)

Use both timeout functionality and manual abort control:

```ts
import wretch from 'wretch';
import AbortAddon from 'wretch/addons/abort';

const controller = new AbortController();

const searchWithTimeout = async (query: string) => {
  const [c, request] = wretch('https://api.example.com/search')
    .addon(AbortAddon())
    .signal(controller)
    .query({ q: query })
    .get()
    .setTimeout(5000)
    .onAbort(() => console.log('Request aborted'))
    .controller();

  return request.json();
};

setTimeout(() => {
  console.log('Manually aborting request');
  controller.abort();
}, 2000);

try {
  const results = await searchWithTimeout('test query');
} catch (error) {
  console.error('Request failed or was aborted');
}
```

<details>
<summary><b>Abort All Pending Requests</b></summary>

```ts
import wretch from 'wretch';
import AbortAddon from 'wretch/addons/abort';

class RequestManager {
  private controllers = new Set<AbortController>();

  createRequest(url: string) {
    const controller = new AbortController();
    this.controllers.add(controller);

    return wretch(url)
      .addon(AbortAddon())
      .signal(controller)
      .resolve(chain => chain.onAbort(() => {
        this.controllers.delete(controller);
      }));
  }

  abortAll() {
    this.controllers.forEach(c => c.abort());
    this.controllers.clear();
  }
}

const manager = new RequestManager();

const req1 = manager.createRequest('https://api.example.com/data1').get().json();
const req2 = manager.createRequest('https://api.example.com/data2').get().json();

manager.abortAll();
```

</details>

### Aborting on Global Errors

> 💡 **Related issues:** [#250](https://github.com/elbywan/wretch/issues/250)

Automatically abort all pending requests when a critical error occurs:

```ts
import wretch from 'wretch';
import AbortAddon from 'wretch/addons/abort';

class ApiClient {
  private globalController = new AbortController();

  private api = wretch('https://api.example.com')
    .addon(AbortAddon())
    .signal(this.globalController)
    .resolve(chain => chain
      .unauthorized(() => {
        this.globalController.abort();
        window.location.href = '/login';
      })
    );

  request<T>(url: string): Promise<T> {
    return this.api.url(url).get().json();
  }

  reset() {
    this.globalController = new AbortController();
  }
}
```

<br>

---

<br>

## 🚀 Advanced Patterns

### Token Refresh & Request Replay

> 💡 **Related issues:** [#226](https://github.com/elbywan/wretch/issues/226)

Automatically refresh expired tokens and retry failed requests:

```ts
import wretch from 'wretch';

let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;

const getToken = () => localStorage.getItem('token');
const setToken = (token: string) => localStorage.setItem('token', token);

const refreshAccessToken = async (): Promise<string> => {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = wretch('https://api.example.com/auth/refresh')
    .post({ refreshToken: localStorage.getItem('refreshToken') })
    .json<{ accessToken: string }>()
    .then(data => {
      setToken(data.accessToken);
      isRefreshing = false;
      refreshPromise = null;
      return data.accessToken;
    })
    .catch(error => {
      isRefreshing = false;
      refreshPromise = null;
      throw error;
    });

  return refreshPromise;
};

const api = wretch('https://api.example.com')
  .auth(`Bearer ${getToken()}`)
  .resolve(chain => chain.unauthorized(async (error, req) => {
    try {
      const newToken = await refreshAccessToken();
      return req.auth(`Bearer ${newToken}`).fetch().json();
    } catch (refreshError) {
      console.error('Token refresh failed, redirecting to login');
      window.location.href = '/login';
      throw refreshError;
    }
  }));

const data = await api.get('/protected/data').json();
```

**With Retry Count Limit:**

```ts
const MAX_RETRIES = 1;

const api = wretch('https://api.example.com')
  .auth(`Bearer ${getToken()}`)
  .resolve(chain => chain.unauthorized(async (error, req) => {
    const retryCount = (req._options as any).__retryCount || 0;

    if (retryCount >= MAX_RETRIES) {
      console.error('Max retries exceeded');
      throw error;
    }

    try {
      const newToken = await refreshAccessToken();
      return req
        .auth(`Bearer ${newToken}`)
        .options({ __retryCount: retryCount + 1 } as any)
        .fetch()
        .json();
    } catch (refreshError) {
      window.location.href = '/login';
      throw refreshError;
    }
  }));
```

### Schema Validation

Validate response data at runtime using Zod or other schema libraries:

```ts
import wretch from 'wretch';
import { z } from 'zod';

const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: z.enum(['admin', 'user', 'guest']),
});

type User = z.infer<typeof UserSchema>;

const validateResponse = <T>(schema: z.Schema<T>) => {
  return async (data: unknown): Promise<T> => {
    return schema.parse(data);
  };
};

const api = wretch('https://api.example.com');

const getUser = async (id: string): Promise<User> => {
  return api
    .url(`/users/${id}`)
    .get()
    .json(validateResponse(UserSchema));
};

try {
  const user = await getUser('123');
  console.log(user.name);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('Invalid response format:', error.errors);
  }
}
```

**As a Middleware:**

```ts
import wretch, { type Middleware } from 'wretch';
import { z } from 'zod';

const validationMiddleware = <T>(
  schema: z.Schema<T>
): Middleware => () => next => async (url, opts) => {
  const response = await next(url, opts);

  if (response.ok) {
    const cloned = response.clone();
    const data = await cloned.json();

    try {
      schema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('Schema validation failed:', error.errors);
      }
    }
  }

  return response;
};

const UserListSchema = z.array(UserSchema);

const api = wretch('https://api.example.com')
  .middlewares([validationMiddleware(UserListSchema)]);

const users = await api.get('/users').json<User[]>();
```

### Handling 202 Accepted Responses

Poll for results when dealing with asynchronous processing:

```ts
import wretch from 'wretch';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface AsyncJobResponse {
  status: 'pending' | 'completed' | 'failed';
  result?: any;
  error?: string;
}

const pollForResult = async (
  jobUrl: string,
  options = {
    maxAttempts: 10,
    interval: 1000,
  }
): Promise<any> => {
  const api = wretch('https://api.example.com');

  for (let attempt = 0; attempt < options.maxAttempts; attempt++) {
    const response = await api.url(jobUrl).get().json<AsyncJobResponse>();

    if (response.status === 'completed') {
      return response.result;
    }

    if (response.status === 'failed') {
      throw new Error(response.error || 'Job failed');
    }

    await delay(options.interval);
  }

  throw new Error('Polling timeout: job did not complete in time');
};

const submitAsyncJob = async (data: any) => {
  const api = wretch('https://api.example.com');

  const response = await api
    .url('/jobs')
    .post(data)
    .res();

  if (response.status === 202) {
    const location = response.headers.get('Location');
    if (!location) {
      throw new Error('No location header in 202 response');
    }

    console.log('Job submitted, polling for result...');
    return pollForResult(location);
  }

  return response.json();
};

const result = await submitAsyncJob({ task: 'process-data' });
console.log('Job completed:', result);
```

**With Exponential Backoff:**

```ts
const pollWithBackoff = async (
  jobUrl: string,
  options = {
    maxAttempts: 10,
    initialInterval: 1000,
    backoffMultiplier: 1.5,
  }
): Promise<any> => {
  const api = wretch('https://api.example.com');
  let interval = options.initialInterval;

  for (let attempt = 0; attempt < options.maxAttempts; attempt++) {
    const response = await api.url(jobUrl).get().json<AsyncJobResponse>();

    if (response.status === 'completed') {
      return response.result;
    }

    if (response.status === 'failed') {
      throw new Error(response.error || 'Job failed');
    }

    console.log(`Attempt ${attempt + 1}: Job still pending, waiting ${interval}ms`);
    await delay(interval);
    interval *= options.backoffMultiplier;
  }

  throw new Error('Polling timeout');
};
```

---

## Contributing

Have a recipe that would benefit others? Please submit a pull request or open an issue with your use case!
