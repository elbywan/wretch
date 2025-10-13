<div align="center">
  <h1>🍳 Wretch Recipes</h1>
  <p><i>Common patterns and solutions for using Wretch, based on real-world use cases from the community.</i></p>
</div>

<br>

## 📋 Table of Contents

- [📋 Table of Contents](#-table-of-contents)
- [⚠️ Error Handling](#️-error-handling)
  - [Parsing Error Response Bodies](#parsing-error-response-bodies)
  - [Handling Non-JSON Error Responses](#handling-non-json-error-responses)
  - [Token Refresh on 401](#token-refresh-on-401)
  - [Detecting Network Errors](#detecting-network-errors)
- [📤 File Uploads \& FormData](#-file-uploads--formdata)
  - [Upload Progress Tracking](#upload-progress-tracking)
  - [Multipart FormData with Files](#multipart-formdata-with-files)
- [🔍 Query Strings \& URLs](#-query-strings--urls)
  - [Filtering Undefined/Null Values](#filtering-undefinednull-values)
  - [Building Complex Query Strings](#building-complex-query-strings)
- [🎛️ Request Control](#️-request-control)
  - [Setting Global Timeouts](#setting-global-timeouts)
  - [Request Deduplication](#request-deduplication)
  - [Retry with Exponential Backoff](#retry-with-exponential-backoff)
- [🔄 Middleware Patterns](#-middleware-patterns)
  - [Request/Response Transformation](#requestresponse-transformation)
  - [Handling Redirects](#handling-redirects)
  - [Custom Status Code Handling](#custom-status-code-handling)
- [🎯 Hooks \& Lifecycle](#-hooks--lifecycle)
  - [Running Code on Every Request](#running-code-on-every-request)
  - [Deferred Request Modifications](#deferred-request-modifications)
- [🚀 Advanced Patterns](#-advanced-patterns)
  - [Schema Validation with Zod](#schema-validation-with-zod)
  - [Replaying Failed Requests](#replaying-failed-requests)
- [Contributing](#contributing)

<br>

## ⚠️ Error Handling

### Parsing Error Response Bodies

**Problem:** APIs return structured error information in response bodies that you need to access.

```ts
import wretch from 'wretch';

interface ApiError {
  code: string;
  message: string;
  details?: any;
}

const api = wretch('https://jsonplaceholder.typicode.com')
  .customError(async (error, response) => {
    const body = await response.json().catch(() => ({ message: 'Unknown error' }));
    return { ...error, apiError: body as ApiError };
  });

try {
  await api.get('/posts/999').json();
} catch (error: any) {
  console.error('Error code:', error.apiError?.code);
  console.error('Error message:', error.apiError?.message);
}
```

### Handling Non-JSON Error Responses

**Problem:** Your API sometimes returns HTML error pages or plain text instead of JSON errors.

```ts
import wretch from 'wretch';

const api = wretch('https://jsonplaceholder.typicode.com')
  .customError(async (error, response) => {
    const contentType = response.headers.get('content-type') || '';
    let errorBody;

    if (contentType.includes('application/json')) {
      errorBody = await response.json();
      console.error('JSON error:', errorBody);
    } else if (contentType.includes('text/html')) {
      errorBody = await response.text();
      console.error('HTML error page received');
    } else {
      errorBody = await response.text();
      console.error('Text error:', errorBody);
    }

    return { ...error, body: errorBody };
  });

try {
  await api.get('/posts/999').json();
} catch (error: any) {
  console.log('Handled error with body:', error.body);
}
```

### Token Refresh on 401

**Problem:** Automatically refresh authentication tokens when they expire and retry the original request.

```ts
import wretch from 'wretch';

let authToken = null;
let refreshCount = 0;

const refreshToken = async () => {
  refreshCount++;
  authToken = `token-${refreshCount}`;
  return authToken;
};

const api = wretch('https://httpbun.com')
  // add the auth header to every request
  .defer((w) => authToken ? w.auth(`Bearer ${authToken}`) : w)
  .resolve(chain =>
    chain.unauthorized(async (error, request) => {
      authToken = await refreshToken();
      return request
         // clear unauthorized catcher to avoid infinite loop
        .resolve(chain => chain, true)
        // replay the original request
        .fetch().json();
    })
  );

await api.get('/bearer/token-1').json();
```

### Detecting Network Errors

**Problem:** Distinguish between network failures (connection issues, DNS failures) and HTTP errors (4xx, 5xx).

```ts
import wretch from 'wretch';

const api = wretch('https://jsonplaceholder.typicode.com').resolve(chain =>
  chain
    .fetchError(error => {
      console.error('Network error - connection failed:', error.message);
      throw error;
    })
    .badRequest(error => {
      console.error('Client error 400 - bad request');
      throw error;
    })
    .internalError(error => {
      console.error('Server error 500 - internal server error');
      throw error;
    })
);

await api.get('/posts/1').json();
```

<br>

---

<br>

## 📤 File Uploads & FormData

### Upload Progress Tracking

**Problem:** Show upload progress to users for better UX.

```ts
import wretch from 'wretch';
import FormDataAddon from 'wretch/addons/formData';
import ProgressAddon from 'wretch/addons/progress';

async function uploadFile(file: File) {
  return wretch('https://api.example.com/upload')
    .addon(FormDataAddon)
    .addon(ProgressAddon())
    .formData({ file })
    .onUpload((loaded, total) => {
      const percent = Math.round((loaded / total) * 100);
      console.log(`Uploading: ${percent}%`);
    })
    .post()
    .json();
}
```

> **Note:** Upload progress requires HTTP/2 (HTTPS) in browsers and doesn't work in Firefox due to streaming limitations.

### Multipart FormData with Files

**Problem:** Send files along with structured data in a single request.

```ts
import wretch from 'wretch';
import FormDataAddon from 'wretch/addons/formData';

const api = wretch('https://httpbun.org/any').addon(FormDataAddon);

await api
  .url('/users/profile')
  .formData({
    userId: '123',
    metadata: { role: 'admin', verified: true },
    avatar: file,
  })
  .post()
  .json();
```

<br>

---

<br>

## 🔍 Query Strings & URLs

### Filtering Undefined/Null Values

**Problem:** Optional search parameters should be omitted from the URL, not sent as empty strings.

```ts
import wretch from 'wretch';
import QueryStringAddon from 'wretch/addons/queryString';

const api = wretch('https://jsonplaceholder.typicode.com').addon(QueryStringAddon);

const searchUsers = (filters: {
  userId?: number;
  id?: number;
  title?: string;
}) => {
  return api
    .url('/posts')
    .query(filters, { omitUndefinedOrNullValues: true })
    .get()
    .json();
};

await searchUsers({ userId: 1, id: undefined, title: undefined });
```

### Building Complex Query Strings

**Problem:** Construct URLs with arrays and nested parameters.

```ts
import wretch from 'wretch';
import QueryStringAddon from 'wretch/addons/queryString';

const api = wretch('https://jsonplaceholder.typicode.com').addon(QueryStringAddon);

// GET https://jsonplaceholder.typicode.com/posts?userId=1&userId=2&_limit=5&_sort=id
await api
  .url('/posts')
  .query({
    userId: [1, 2],
    _limit: 5,
    _sort: 'id'
  })
  .get()
  .json();
```

<br>

---

<br>

## 🎛️ Request Control

### Setting Global Timeouts

**Problem:** Set a default timeout for all requests to prevent hanging.

```ts
import wretch from 'wretch';
import AbortAddon from 'wretch/addons/abort';

const api = wretch('https://jsonplaceholder.typicode.com')
  .addon(AbortAddon())
  .resolve(chain => chain.setTimeout(5000));

await api.get('/posts/1').json();

const longerRequest = await api
  .get('/posts/2')
  .setTimeout(30000)
  .json();
```

### Request Deduplication

**Problem:** Prevent multiple identical requests from being sent simultaneously.

```ts
import wretch from 'wretch';
import { dedupe } from 'wretch/middlewares';

const api = wretch('https://jsonplaceholder.typicode.com').middlewares([
  dedupe()
]);

const [data1, data2, data3] = await Promise.all([
  api.get('/posts/1').json(),
  api.get('/posts/1').json(),
  api.get('/posts/1').json(),
]);
```

### Retry with Exponential Backoff

**Problem:** Automatically retry failed requests with increasing delays.

```ts
import wretch from 'wretch';
import { retry } from 'wretch/middlewares';

const api = wretch('https://jsonplaceholder.typicode.com').middlewares([
  retry({
    delayTimer: 100,
    delayRamp: (delay, attempts) => delay * 2,
    maxAttempts: 3,
    until: (response) => response?.ok,
    onRetry: ({ attempt, error, url }) => {
      console.log(`Retry ${attempt} for ${url}:`, error?.message);
    }
  })
]);

await api.get('/posts/1').json();
```

<br>

---

<br>

## 🔄 Middleware Patterns

### Request/Response Transformation

**Problem:** Convert data between `snake_case` and `camelCase` for all requests.

```ts
import wretch from 'wretch';

const snakeToCamel = (obj: any): any => {
  if (Array.isArray(obj)) return obj.map(snakeToCamel);
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      const camelKey = key.replace(/_([a-z])/g, (_, char) => char.toUpperCase());
      acc[camelKey] = snakeToCamel(obj[key]);
      return acc;
    }, {} as any);
  }
  return obj;
};

const camelToSnake = (obj: any): any => {
  if (Array.isArray(obj)) return obj.map(camelToSnake);
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      const snakeKey = key.replace(/[A-Z]/g, char => `_${char.toLowerCase()}`);
      acc[snakeKey] = camelToSnake(obj[key]);
      return acc;
    }, {} as any);
  }
  return obj;
};

const api = wretch('https://jsonplaceholder.typicode.com')
  .defer((w, _url, opts) => {
    if (opts.body && typeof opts.body === 'string') {
      try {
        const parsed = JSON.parse(opts.body);
        return w.body(JSON.stringify(snakeToCamel(parsed)));
      } catch {}
    }
    return w;
  })
  .resolve(chain => chain.json(json => camelToSnake(json)));

console.log(await api.get('/users/1'));
```

### Handling Redirects

**Problem:** Detect and handle HTTP redirects manually.

```ts
import wretch from 'wretch';

const api = wretch('https://api.example.com')
  .options({ redirect: 'manual' })
  .middlewares([
    next => async (url, opts) => {
      const response = await next(url, opts);

      if (response.status === 302 || response.status === 301) {
        const location = response.headers.get('location');
        console.log(`Redirect detected to: ${location}`);
        window.location.href = location;
        throw new Error('Redirected');
      }

      return response;
    }
  ]);
```

### Custom Status Code Handling

**Problem:** Handle non-standard HTTP status codes like 202 Accepted.

```ts
import wretch from 'wretch';

class AcceptedError extends Error {
  name = 'AcceptedError';
  constructor(public response: Response) {
    super('Request accepted for processing');
  }
}

const api = wretch('https://jsonplaceholder.typicode.com')
  .middlewares([
    next => async (url, opts) => {
      const response = await next(url, opts);
      if (response.status === 202) {
        throw new AcceptedError(response);
      }
      return response;
    }
  ])
  .catcher('AcceptedError', (error: AcceptedError) => {
    console.log('Request is being processed asynchronously');
    return { status: 'processing' };
  });

const result = await api.url('/posts').json({ title: 'test', body: 'test', userId: 1 }).post().json();
```

<br>

---

<br>

## 🎯 Hooks & Lifecycle

### Running Code on Every Request

**Problem:** Execute logging, analytics, or UI updates for all requests.

```ts
import wretch from 'wretch';

const loggingMiddleware = next => async (url, opts) => {
  console.log(`→ ${opts.method || 'GET'} ${url}`);

  try {
    const response = await next(url, opts);
    console.log(`✓ ${response.status} ${url}`);
    return response;
  } catch (error) {
    console.error(`✗ Request failed: ${url}`, error);
    throw error;
  }
};

const api = wretch('https://jsonplaceholder.typicode.com').middlewares([
  loggingMiddleware
]);

await api.get('/posts/1').json();
```

### Deferred Request Modifications

**Problem:** Add headers or modify requests just before they're sent, based on runtime state.

```ts
import wretch from 'wretch';

let currentLocale = 'en-US';
let requestCounter = 0;

const api = wretch('https://jsonplaceholder.typicode.com')
  .defer((w, url, opts) => {
    return w.headers({
      'Accept-Language': currentLocale,
      'X-Request-ID': `req-${++requestCounter}`,
      'X-Timestamp': new Date().toISOString()
    });
  });

currentLocale = 'fr-FR';
await api.get('/posts/1').json();
```

<br>

---

<br>

## 🚀 Advanced Patterns

### Schema Validation with Zod

**Problem:** Validate API responses at runtime to ensure type safety.

<!-- snippet:skip -->
```ts
import wretch from 'wretch';
import { z } from 'zod';

const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
  createdAt: z.string().datetime()
});

type User = z.infer<typeof UserSchema>;

const api = wretch('https://api.example.com');

const user = await api
  .get('/users/123')
  .json<User>(UserSchema.parse);

const users = await api
  .get('/users')
  .json<User[]>(data => z.array(UserSchema).parse(data));
```

### Replaying Failed Requests

**Problem:** Retry a failed request with the same resolver method (json, blob, etc).

```ts
import wretch from 'wretch';

let tokenRefreshCount = 0;
const refreshAuthToken = async () => `new-token-${++tokenRefreshCount}`;

const api = wretch('https://jsonplaceholder.typicode.com')
  .catcher(401, async (error, request) => {
    const newToken = await refreshAuthToken();
    return request
      .auth(`Bearer ${newToken}`)
      .fetch()
      .unauthorized(err => { throw err })
      .json();
  });

const data = await api
  .get('/posts/1')
  .json();
```

---

## Contributing

Have a recipe that would benefit others? Please submit a pull request or open an issue with your use case!
