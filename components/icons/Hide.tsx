export function HideIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <g transform="translate(2,4.5)" fill="currentColor"><path d="M10,0 C6.2,0 2.7,2.1 0.3,5.4 C-0.1,6 -0.1,6.9 0.3,7.5 C2.7,10.8 6.2,13 10,13 C13.8,13 17.3,10.9 19.7,7.5 C20.1,6.9 20.1,6 19.7,5.4 C17.3,2.1 13.8,0 10,0 Z M10,10.5 C8.1,10.5 6.5,8.9 6.5,7 C6.5,5.1 8.1,3.5 10,3.5 C11.9,3.5 13.5,5.1 13.5,7 C13.5,8.9 11.9,10.5 10,10.5 Z"/></g>
    </svg>
  );
}
