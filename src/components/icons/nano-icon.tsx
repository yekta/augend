import { cn } from "@/lib/utils";

export default function NanoIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn("size-6", className)}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M13.9586 10.8501L18.5002 3.46997H15.9968L12.0002 9.96449L8.00356 3.46997H5.50017L10.0418 10.8501H5V13.1461H10.0423L8.83113 15.1142H5V17.4102H7.4182L5.50066 20.5262H8.00405L9.92159 17.4102H14.0788L15.9963 20.5262H18.4997L16.5822 17.4102H19V15.1142H15.1693L13.9581 13.1461H19V10.8501H13.9586ZM12.6659 15.1142L12.0002 14.0325L11.3345 15.1142H12.6659Z"
        fill="currentColor"
      />
    </svg>
  );
}
