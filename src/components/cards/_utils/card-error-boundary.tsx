import CardInnerWrapper from "@/components/cards/_utils/card-inner-wrapper";
import CardOuterWrapper from "@/components/cards/_utils/card-outer-wrapper";
import CopyErrorButton from "@/components/cards/_utils/copy-error-button";
import { cn } from "@/lib/utils";
import { TriangleAlertIcon } from "lucide-react";
import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  className?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class CardErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: undefined,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("Error caught by Error Boundary:", error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <CardOuterWrapper className={cn("h-32", this.props.className)}>
          <CardInnerWrapper className="max-h-full overflow-auto border-destructive/25">
            {this.props.fallback || (
              <div className="w-full flex flex-col items-center pt-2.5 gap-2.5">
                <div className="text-destructive px-4 flex items-center justify-center gap-1.5">
                  <TriangleAlertIcon className="size-4 shrink-0" />
                  <p className="font-semibold text-sm  text-left shrink min-w-0">
                    Card had an unexpected error.
                  </p>
                </div>
                <div className="w-full flex items-center flex-col gap-3">
                  <CopyErrorButton
                    textToCopy={
                      (this.state.error?.message || "Unknown error") +
                        this.state.error?.stack || "Unknown stack"
                    }
                  />
                  <pre className="w-full overflow-auto text-xs font-mono font-medium text-destructive bg-destructive/10 px-3 py-2">
                    {this.state.error?.message || "Unknown error"}
                    {this.state.error?.stack || "Unknown stack"}
                  </pre>
                </div>
              </div>
            )}
          </CardInnerWrapper>
        </CardOuterWrapper>
      );
    }

    return this.props.children;
  }
}

export default CardErrorBoundary;
