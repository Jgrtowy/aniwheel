<div align="center">
<a href="https://aniwheel.moe"><img width="500" height="167" alt="Aniwheel banner" src="https://github.com/user-attachments/assets/15e736c0-422b-4b17-90ce-b97460381cbb" /></a>
</div>

### A simple app created for those who can't decide which anime from their planned list watch as next. 🤔

### Simply select your nominees, spin the wheel and let the fortune decide! 🍀

## Features ⭐

- MAL and AniList support
- Multiple filters and sorting options
- Toggleable tick sounds while spinning
- Option to include "Dropped" and "On-hold" titles
- Preferable title languages
- Recommendations dropdown
- Special sidebar to add new titles to your "Plan to watch" with sync to your anime tracker
- Both dark and light mode
*...and more to come!*

<details>
  <summary><h2><a href="#">&#x200B;</a>Screenshots 📷</h2><sub>*click!*</sub></summary>
  <img width="1582" height="1030" alt="SCR-20250817-tdjx" src="https://github.com/user-attachments/assets/119385a3-ea87-4671-acb6-58772a8940ce" />
  <img width="1582" height="1030" alt="SCR-20250817-tdyh" src="https://github.com/user-attachments/assets/7a243ea0-f0b7-453a-add0-26d8fe5b31c8" />
  <img width="1582" height="1030" alt="SCR-20250817-tdwq" src="https://github.com/user-attachments/assets/511b4c38-b105-4e72-b370-62e7141e4c36" />
  <img width="1582" height="1030" alt="SCR-20250817-tebz" src="https://github.com/user-attachments/assets/831dd79a-dbba-4f78-9e6d-97b10fff4909" />
  <img width="1582" height="1030" alt="SCR-20250817-teel" src="https://github.com/user-attachments/assets/d134c71e-c2ce-48e3-824e-a52af6d6db57" />
  <img width="1582" height="1030" alt="SCR-20250817-tfzz" src="https://github.com/user-attachments/assets/149200ba-5a59-4a18-93b7-f0991f509e76" />
</details>

## Developing 🧑‍💻

Built on top of [Next.js](https://nextjs.org), using [Bun](https://bun.sh) runtime.

1. Clone the repo.

```sh
$ git clone https://github.com/Jgrtowy/aniwheel.git
```

2. Create new OAuth clients both on [AniList](https://anilist.co/settings/developer) and [MyAnimeList](https://myanimelist.net/apiconfig#_=_) websites.

> [!IMPORTANT]  
> For MAL set app type to "Other" to ***only*** get client ID. It is necessery to run the app ***without*** the secret which is assigned when selecting other app types.

3. Set their redirect URLs to `http://localhost:3000`.

4. Copy `.env.example` file, rename it to `.env` and fill out all fields.

5. Generate NextAuth secret

```sh
$ openssl rand -base64 32
```

and paste it to `.env` file.

6. Install dependencies

```sh
$ bun i
```

7. Run development server

```sh
$ bun dev
```

And you're ready to go!

## Contributing 🌟

Contributions are always appreciated in any form!

Found an issue? Have an idea for a new feature? Create an issue!

Want to fix or implement something new? Fork repo, make commits, create a pull request and (hopefully) we'll merge it!

Need to contact us privately? Reach us at <a href="mailto:team@aniwheel.moe">team@aniwheel.moe</a>
