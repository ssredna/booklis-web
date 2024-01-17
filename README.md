# Booklis

En nettside for å lage lesemål, som også forteller deg hvor mye du må lese hver dag for å nå målet!

<img width="600" alt="Screenshot of Booklis header" src="https://github.com/ssredna/booklis/assets/33721320/f6d18f78-68bd-4cba-887c-7579d5cd8525">

Jeg har allerede en tilsvarende app for Android [her](https://github.com/ssredna/booklis), så hvorfor har jeg laget denne?

Vel, appen bruker bare lokal state, altså laster den ikke opp dataen noe sted. Når jeg gjør oppdateringer på appen, så må jeg installere den på nytt, og mister altså all dataen. Jeg kunne brukt tid på å fikse appen, men akkurat nå hadde jeg mer lyst til å lage en nettside.

I tillegg så er det enda lettere å dele det med andre når det er en nettside.

# Teknologier

Her er en liten gjennomgang av teknologier jeg har brukt, og hva jeg har lært gjennom dette prosjektet.

## SvelteKit

Jeg har brukt SvelteKit. Grunnen til at jeg gikk for SvelteKit er hovedsakelig fordi hver gang jeg bruker det blir jeg bare mer glad i det (i motsetning til React, dessverre). SvelteKit fjerner kompleksitet, og oppmuntrer deg til å bruke web-standarder. Jeg har aldri brukt så mye `form` som i Booklis!

Jeg kommer ikke til å gå gjennom alt jeg kan om SvelteKit her, men jeg vil trekke frem noen områder jeg har fokusert litt ekstra på denne gangen. Og som hintet til, så starter jeg med ...

### form

Måten SvelteKit håndterer forms på er at man peker det til en form-action som er definert i `+page.server.ts`. For eksempel i mitt form for å legge til en ny bok:

```html
<form method="post" action="?/addExistingBook" use:enhance>...</form>
```

Og i `+page.server.ts` håndterer jeg den actionen:

```typescript
export const actions = {
  addExistingBook: async ({ request }) => {
    const data = await request.formData();

    const bookId = data.get('bookId');
    const goalId = data.get('goalId');

    // validere inputten

    try {
      // bruke den
      await addExistingBookToGoal(...);
    } catch (error) {
      // håndtere error
    }
  },
}
```

Dette gjør at formen fungerer, selv uten JavaScript. Det som kan gjøre det litt irriterende er jo at en native form fungerer ved med å reloade siden osv., noe som skaper en litt hakkete opplevelse for brukeren. Det fikser vi med å legge på `use:enhance` i `form`-taggen. Da vil SvelteKit bruke JavaScript til å forbedre klient-opplevelsen, men fortsatt kunne falle tilbake på native `form`. Altså blir det "progressive enhancement".

`use:enhance` kan vi også bruke til å gi oss innsikt i hvordan det ligger ann med requesten, slik at vi kan gi litt feedback til brukeren, som f.eks. her:

```svelte
<script lang="ts">
  import { enhance } from '$app/forms';

  let isFormSubmitting = false;
</script>

<form
  action="?/addExistingBook"
  method="post"
  use:enhance={() => {
    isFormSubmitting = true;

    return async ({ update }) => {
      isFormSubmitting = false;
      update();
    };
  }}
>
```

Dermed kan vi bruke `isFormSubmitting` til å disable en knapp eller vise en spinner osv.

Denne progressive enhancement-approachen for å gjøre requests til backenden liker jeg godt, men hva med de gangene vi ikke egentlig har å gjøre med en `form`, men heller bare en knapp?

No worries! De knappene kan også være `form`s, bare med skjulte input-felter som settes automatisk. For eksempel, knappen som markerer en bok som fullført:

<img width="435" alt="image" src="https://github.com/ssredna/booklis/assets/33721320/469daffa-f177-4a81-a9ff-a19b10a6e091">

Er egentlig et `form` med skjulte input-felter:

```svelte
<form action="?/finishBook" method="post" use:enhance>
	<input type="hidden" name="goalId" value={$goal.id} required />
	<input type="hidden" name="activeBookId" value={activeBook.id} required />
	<input type="hidden" name="bookId" value={book.id} required />
	<input type="hidden" name="startDate" value={activeBook.startDate} required />

	<Button type="submit" class="mt-2">
		<Check class="mr-2 h-4 w-4" />
		Fullfør bok
	</Button>

	{#if $page.form?.finishBookError}
		<p>Noe gikk galt under flyttingen av boken til fullført</p>
	{/if}
</form>
```

(Det må jo nevnes at hvis disse verdiene settes programmatisk på klienten så vil det hindre de fra å fungere uten javascript igjen, vil jeg tro.)

Så dermed er det kanskje ikke så overraskende at det fort blir maange `form`s!

#### Validering

Allikevel er det ikke alt jeg føler jeg har fått helt dreisen på med SvelteKit og forms enda.

Et eksempel på dette er validering, og mulighet til å gi spesifikk feedback til brukeren på hva som evt. gitt galt. Jeg har brukt `zod` og skjemaer for å validere inputten, for så å returnere en spesifikk error for å signalisere hvor erroren er:

```typescript
// inne i form-actionen
const data = await request.formData();
const bookId = data.get('bookId');
const goalId = data.get('goalId');

const parsedBookId = idSchema.safeParse(bookId);
if (!parsedBookId.success) {
	return fail(422, { bookIdError: true });
}

const parsedGoalId = idSchema.safeParse(goalId);
if (!parsedGoalId.success) {
	return fail(422, { goalIdError: true });
}
```

Dermed kan jeg reagere på dette i UIet:

```svelte
{#if $page.form?.updatePagesReadError}
	<p>Noe gikk galt i lagringen</p>
{/if}
```

Dette funker, men jeg er ikke helt fornøyd med det. Blir fort mye boilerplate når et form har mange inputs. Og i min løsning her så returnerer jeg jo bare at det ER en error, ikke egentlig hva den er (noe jeg kunne løst med å returnere den faktiske `zod` erroren).

Istedenfor å finne en god løsning på dette, så endte jeg opp med å bruke et bibliotek som har løst dette, og mer, av forms på en veldig fin måte.

### Superforms

Superforms tar seg av mye av den overnevnte boilerplaten, og gjør det enda lettere og mer intuitivt å bruke `form`s i SvelteKit. Her definerer du formen på form-inputten i et `zod`-skjema. Form-objektet, basert på skjemaet, opprettes og returneres i `load`-funksjonen:

```typescript
export const load = async () => {
	return {
		createGoalForm: await superValidate(createGoalSchema),
		editGoalForm: await superValidate(editGoalSchema)
		// osv
	};
};
```

Dermed kan man bruke dette objektet der man har `form`-et:

```svelte
<script lang="ts">
	export let createGoalForm: SuperValidated<CreateGoalSchema>;

	const { form, errors, delayed, submitting, enhance } = superForm(createGoalForm);
</script>

<form method="post" action="?/createGoal" use:enhance>
	<label for="numberOfBooks">Hvor mange bøker vil du lese? </label>
	<input id="numberOfBooks" name="numberOfBooks" type="number" bind:value={$form.numberOfBooks} />
	{#if $errors.numberOfBooks}
		<small class="text-destructive">{$errors.numberOfBooks}</small>
	{/if}

	<Button type="submit" disabled={$submitting}>
		{#if $delayed}
			<Loader2 class="mr-2 h-4 w-4 animate-spin" />
		{/if}
		Opprett mål
	</Button>
</form>
```

Da har man enkelt tilgang til alle error-meldinger som kommer fra valideringen på server. Det er også mye andre muligheter, og her har jeg også brukt `submitting` som er `true` når den holder på å submitte, og `delayed` som blir `true` etter 500 ms (by defaul, kan endres på), til å gi litt feedback til brukeren om at requesten er i gang.

Det er også mulig å gjøre klient-side validering med dette, der den også bare bruker zod-skjemaet.

Det gjorde `form`-opplevelsen enda bedre å gå over til Superforms, og jeg skulle ønske jeg hadde begynt å bruke den helt fra start, ettersom jeg først implementerte alle forms med bare SvelteKit, og så skrev om noen av formsene til å bruke Superforms i ettertid.

#### Drawback

En bit jeg har tenkt på som en potensiell negativ følge av å bruke Superforms er at alle forms må returneres i `load`-funksjonen. Det er jo greit nok, men for meg som bruker et form for alle requests i appen, så blir det fort veldig mange forms som skal returneres i `load`-funksjonen. Det kan hende at en mellom-løsning blir å bare bruke Superforms der det er faktisk input-felt, og heller native SvelteKit der det bare er en knapp med skjulte input-felter.

## Auth.js

Det er mulig å logge inn i denne appen, og dermed måtte jeg jo ha med en form for autentisering. Da valgte jeg å gå for [Auth.js](https://authjs.dev/). Det var ikke superlett å sette opp <i>bare</i> ved hjelp av dokumentasjonen deres, men med litt hjelp fra YouTube var det ikke noe problem.

Hovedsakelig settes denne autentiseringen opp i `hooks.server.ts`, hvor man kan konfigurere noe lignende middlewares. Hooks intercepter alle requests, noe som gjør det til et perfekt sted å implementere autentisering. For å sette opp med Google som provider er det enkelt og greit:

```typescript
import { SvelteKitAuth } from '@auth/sveltekit';
import Google from '@auth/sveltekit/providers/google';

export const handle = SvelteKitAuth({
	providers: [
		Google({
			clientId: GOOGLE_ID,
			clientSecret: GOOGLE_SECRET
		})
	]
});
```

Så må man også sette opp en app i Google Cloud, og legge inn callback-url, noe som ikke akkuratt er en intuitiv prosess, men YouTube hjelper fint her også.

For å hente informasjon om du er autentisert, enten i `load` eller på klienten, kan man hente det fra `locals`-objektet. Dermed kan man lett eksponere informasjon om brukeren til klienten ved å returnere det, som f.eks. her i `+layout.server.ts`:

```typescript
export const load = async (event) => {
	return {
		session: await event.locals.getSession()
	};
};
```

### bruker-id

By default så oppretter `auth.js` ingen bruker i noen database. Altså får man bare informasjon om at en bruker <i>er</i> autentisert, navn og e-post, men ikke mye mer. Det er mulig å sette opp adapter med `auth.js`, for å automatisk opprette brukere når noen logger inn, i f.eks. firebase (de har mange forskjellige adaptere til forskjellige databaser), men jeg har egentlig ikke noe behov for å lagre noe bruker-data for denne appen.

Det jeg har behov for, derimot, er en form for bruker-id. I `jws`-tokenet som genereres av Google når man logger inn er det et felt `sub` (for Subject), som inneholder en slags bruker-id. Så da bruker jeg bare dette som bruker-id, så trenger jeg ikke å lagre noe bruker-data selv.

Siden dette feltet ikke blir automatisk returnert fra `await event.locals.getSession()`, og jeg ikke klarte å få tilgang til `jwt`-tokenet utenfor hooks-funksjonen, måtte jeg sende det videre fra denne funksjonen. Heldigvis så var det mange måter å tilpasse `SvelteKitAuth`-objektet når man oppretter det, og jeg endte opp med dette:

```typescript
SvelteKitAuth({
	providers: [...],
	callbacks: {
		session: ({ session, token }) => {
			session.user = { ...session.user, id: token.sub ?? '' };
			return session;
		}
	}
});
```

Her putter jeg altså inn `sub`-feltet fra `jws`-tokenet inn i det som returneres fra `await event.locals.getSession()`, og jeg kan dermed eksponere bruker-id til `load`-funksjoner og klient.

### automatisk innlogging

Jeg vil også nevne at by default så logger `auth.js` deg inn automatisk etter du har logget inn en gang. Altså får man ikke mulighet til å velge hvilken bruker man vil logge på med etter den første gangen. Dette var litt irriterende (synes jeg), men det var mulig å skru av dette med denne tilpassingen:

```typescript
// Inne i SvelteKitAuth({...})
Google({
	clientId: GOOGLE_ID,
	clientSecret: GOOGLE_SECRET,
	authorization: {
		params: {
			prompt: 'consent',
			access_type: 'offline',
			response_type: 'code'
		}
	}
});
```

### isOwner

I denne siden så er det ingenting som stopper deg fra å besøke noen andre sitt lesemål, hvis du har deres bruker-id. Du får ikke gjort så mye der, men du kan se hvordan det står til med andres lese-mål.

På grunn av dette ville jeg ha en enkel måte å finne ut av om en bruker er eieren av det målet den er inne på. Altså, for hver request vil jeg sjekke om bruker-id-en i url-en er den samme som bruker-id-en som ligger i session. Dermed var dette noe jeg valgte å løse i `hooks.server.ts`, siden denne intercepter alle requests.

```typescript
const isOwner = (async ({ event, resolve }) => {
	if (event.params.userId) {
		const session = await event.locals.getSession();

		const isOwner = !!session?.user && session.user.id === event.params.userId;

		event.locals.isOwner = isOwner;
	}

	return resolve(event);
}) satisfies Handle;
```

Her sjekker jeg først om det er en bruker-id i url-en, og så sammenligner den med bruker-id-en i sessionen. Dermed populerer jeg event.locals med resultatet av denne sammenligningen i verdien `isOwner`.

`locals` er et objekt som blir opprettet for hver request, og er så tilgjengelig for andre `load` funksjoner, og form-actions. Dermed kan jeg returnere `isOwner` fra `load`-funksjonen, og så reagere på denne i UI-et for å f.eks. skjule rediger-knapper hvis du ikke er eier:

```svelte
{#if $isOwner}
	<Button on:click={() => (isEditing = true)}>
		<Edit class="mr-2 h-4 w-4" />
		Rediger mål
	</Button>
{/if}
```

Og i form-actions kan det se slik ut:

```typescript
createGoal: async (event) => {
	if (!event.locals.isOwner) return fail(403, { unauthorized: true });

	// osv
};
```

Jeg har fortsatt en del igjen på å oppdatere UIet til å reflektere om du er logget inn eller ikke. Nå ser det fortsatt ut som at du kan gjøre mye endringer hos en annens lesemål.

## shadcn-svelte

Jeg har brukt et slags ui-bibliotek, nemlig [shadcn-svelte](https://www.shadcn-svelte.com/). Her installerer man ikke en npm-pakke, men man kopierer og limer inn komponentene, slik at man kan endre og bygge videre på disse selv. Dette er en uoffisiell port av shadcn, men virker til å være veldig aktivt maintaina.

Det å si at man ikke installerer en npm-pakke er egentlig litt misvisende da, siden `shadcn-svelte` bygger komponentene sine ved hjelp av en npm-pakke, kalt `bits-ui`. Men `bits-ui` er et relativt lav-nivå komponent-bibliotek, så `shadcn-svelte` eksponerer disse som mer ferdige komponenter, klare til bruk, eller videre modifisering.

Jeg har vært veldig fornøyd med de fleste komponenter jeg har brukt fra `shadcn-svelte`, med et par unntak.

### Form

De har en form-implementasjon, men etter å ha testet den ut fikk jeg problemer med klient-side valideringen, og endte opp med å bare droppe den. Til `shadcn-svelte` sitt forsvar så var den markert som "preview" på dokumentasjonen sin, så den trenger nok fortsatt litt finpuss.

<img width="210" alt="image" src="https://github.com/ssredna/booklis/assets/33721320/a789ae24-64d0-4df6-91c0-cb8393330554">

### Slider

Slideren jeg bruker for å endre hvor mange sider man har lest er `shadcn-svelte` sin slider.

<img width="446" alt="image" src="https://github.com/ssredna/booklis/assets/33721320/9b593b24-c365-4ce1-adf1-b53f6c769426">

Jeg hadde først brukt en native `<input type="range" />`, som fungerte helt ok, men glitcha litt innimellom, uten at jeg klarte å finne ut av hvorfor. Når jeg byttet til denne slideren forsvant glitchingen, men jeg møtte et nytt problem: Jeg klarte ikke å finne eventen for når inputten endrer verdi.

På en vanlig `<input type="range" />` så vil man ved å legge på en `on:change` listener fange opp når man <i>slipper</i> slideren. Altså kan man lagre en gammel verdi, og så sjekke den nye verdien i `on:change`, for så å finne forskjellen.

I `shadcn-svelte` så eksponeres det en `onValueChange` callback, som reagerer for hvert steg man tar på slideren, men jeg klarte ikke å finne noen mulighet for å reagere på når man slipper slideren.

Siden jeg vil lagre det når man slipper, skapte dette problemer for meg.

Jeg endte opp med å registrere slideren som "dirty" i `onValueChange`, for så å ha en `on:click`-listener på hele window-elementet, som lagrer hvis slideren er "dirty":

```svelte
<svelte:window
	on:click={() => {
		if (isDirty) {
			$goal.pagesReadToday = Math.max($goal.pagesReadToday + increase, 0);
			oldPagesRead = activeBook.pagesRead;
			pagesReadForm.requestSubmit();
		}
	}}
/>

<Slider
	...
	onValueChange={() => {
		isDirty = true;
	}}
/>
```

Siden jeg her programmatisk submitter formet, la jeg også inn en fallback submit-knapp hvis det ikke skulle være javascript tilgjengelig. Jeg vet fortsatt ikke om det var bare unødvendig.

```html
<noscript>
	<input type="submit" value="Lagre" />
</noscript>
```

# Forbedringspotensiale

Alt i alt er jeg veldig fornøyd med hva jeg har fått til med Booklis på web. Det er jo allikevel selvfølgelig mye forbedringspotensiale:

- Oppdatere UI tilstrekkelig når man ser på andres mål. Nå er det lite endring, og det ser ut som at man får lov til å gjøre endringer på andres vegne, noe man jo ikke kan.
- Endre litt på `shadcn-svelte` komponentene, ettersom de nå er veldig clean of fine, men liitt kjedelige.
- Enda mer feedback til brukeren. Nå er det ikke alle knapper som viser at det er en aktiv request når du trykker på dem. Henger nok litt sammen med at jeg ikke har gått over til Superforms på alt enda.
- Bedre mobil-UI. Det funker på mobil, og ikke så verst heller, men det er bare "flaks".
