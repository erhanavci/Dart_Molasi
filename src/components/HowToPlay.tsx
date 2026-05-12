import { ArrowLeft } from "lucide-react";
import Button from "./Button";
import Card from "./Card";

export default function HowToPlay({ onBack }: { onBack: () => void }) {
  return (
    <section className="grid flex-1 place-items-center py-6">
      <Card className="max-w-3xl">
        <h2 className="text-3xl font-black">Nasıl Oynanır?</h2>
        <p className="mt-4 text-lg leading-8 text-slate-200">
          Nişangahı hedefe getir, basılı tutarak gücü ayarla ve bırakınca dartı fırlat. Bullseye en yüksek puanı verir.
          Parlayan double ve triple alanlarını vurursan ekstra bonus kazanırsın. Üst üste başarılı atışlar yaparak kombonu büyüt.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {[
            ["Hızlı 201", "201'den tam sıfıra in. Puanı aşarsan tur iptal edilir."],
            ["Bull Rush", "90 saniyede en yüksek skoru yap. Hareketli Bull'u yakala."],
            ["Ofis Düellosu", "İki oyuncu sırayla 5 tur oynar. En yüksek skor kazanır."],
            ["Patron Geliyor", "Patron Alarmı dolmadan bol puan topla."]
          ].map(([title, text]) => (
            <div key={title} className="rounded-xl bg-slate-950/40 p-4">
              <h3 className="font-black text-emerald-200">{title}</h3>
              <p className="mt-1 text-sm text-slate-300">{text}</p>
            </div>
          ))}
        </div>
        <Button variant="ghost" icon={<ArrowLeft size={17} />} onClick={onBack} className="mt-6">Menüye Dön</Button>
      </Card>
    </section>
  );
}
