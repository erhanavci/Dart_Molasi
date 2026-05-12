import Button from "./Button";

export default function Splash({ onStart }: { onStart: () => void }) {
  return (
    <section className="grid flex-1 place-items-center text-center">
      <div className="max-w-3xl">
        <div className="mx-auto mb-7 grid h-28 w-28 place-items-center rounded-full border-8 border-emerald-300 bg-slate-950 shadow-neon">
          <div className="h-12 w-12 rounded-full border-[14px] border-rose-500 bg-amber-300" />
        </div>
        <h1 className="text-6xl font-black leading-none sm:text-8xl">Dart Molası</h1>
        <p className="mx-auto mt-5 max-w-xl text-xl font-semibold text-slate-200">10 dakikalık ofis rekabeti</p>
        <Button onClick={onStart} className="mt-9 px-8">Başla</Button>
      </div>
    </section>
  );
}
