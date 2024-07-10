<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [tough-cookie](./tough-cookie.md) &gt; [CookieJar](./tough-cookie.cookiejar.md) &gt; [clone](./tough-cookie.cookiejar.clone_2.md)

## CookieJar.clone() method

Produces a deep clone of this CookieJar. Modifications to the original do not affect the clone, and vice versa.

**Signature:**

```typescript
clone(newStore?: Store): Promise<CookieJar>;
```

## Parameters

<table><thead><tr><th>

Parameter


</th><th>

Type


</th><th>

Description


</th></tr></thead>
<tbody><tr><td>

newStore


</td><td>

[Store](./tough-cookie.store.md)


</td><td>

_(Optional)_ The target [Store](./tough-cookie.store.md) to clone cookies into.


</td></tr>
</tbody></table>
**Returns:**

Promise&lt;[CookieJar](./tough-cookie.cookiejar.md)<!-- -->&gt;

## Remarks

- When no [Store](./tough-cookie.store.md) is provided, a new [MemoryCookieStore](./tough-cookie.memorycookiestore.md) will be used.

- Transferring between store types is supported so long as the source implements `.getAllCookies()` and the destination implements `.putCookie()`<!-- -->.
