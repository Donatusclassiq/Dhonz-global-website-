from pathlib import Path

path = Path('/home/ubuntu/dhonz-global/client/src/pages/Home.tsx')
text = path.read_text()
text = text.replace('https://wa.me/2348000000000', 'https://wa.me/2347070757036')
text = text.replace(
    '<a href="https://wa.me/2347070757036">WhatsApp us</a><span>Abuja · Lagos · Africa</span>',
    '<a href="https://wa.me/2347070757036">WhatsApp us</a><a href="tel:+2347070757036">Call +234 707 075 7036</a><span>Abuja · Lagos · Africa</span>',
)
text = text.replace(
    '<div className="rounded-2xl border border-white/10 p-6"><Mail className="text-[#d4af37]" size={20}/><h3 className="mt-5 text-lg font-semibold">Email</h3>',
    '<div className="rounded-2xl border border-white/10 p-6"><Mail className="text-[#d4af37]" size={20}/><h3 className="mt-5 text-lg font-semibold">Email</h3>',
)
needle = '<a href="https://wa.me/2347070757036" className="mt-4 inline-flex items-center gap-2 text-sm text-[#d4af37]">Open WhatsApp <ArrowUpRight size={15}/></a></div><div className="rounded-2xl border border-white/10 p-6"><Mail'
replacement = '<a href="https://wa.me/2347070757036" className="mt-4 inline-flex items-center gap-2 text-sm text-[#d4af37]">Open WhatsApp <ArrowUpRight size={15}/></a><a href="tel:+2347070757036" className="mt-3 inline-flex items-center gap-2 text-sm text-[#d4af37]">Call +234 707 075 7036 <ArrowUpRight size={15}/></a></div><div className="rounded-2xl border border-white/10 p-6"><Mail'
if needle not in text:
    raise SystemExit('Contact page WhatsApp block not found')
text = text.replace(needle, replacement, 1)
path.write_text(text)

remaining = '2348000000000' in text
if remaining:
    raise SystemExit('Placeholder contact number remains')
print('Updated WhatsApp and call links to +234 707 075 7036')
