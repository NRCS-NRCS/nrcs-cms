import {
    useMemo,
    useState,
} from 'react';
import {
    type Language,
    type LanguageContextProps,
} from '@ifrc-go/ui/contexts';
import { noOp } from '@togglecorp/fujs';

function useLanguageContextProviderValue() {
    const [currentLanguage, setCurrentLanguage] = useState<Language>('en');
    const [strings, setStrings] = useState<LanguageContextProps['strings']>({});
    const [
        languageNamespaceStatus,
        setLanguageNamespaceStatus,
    ] = useState<LanguageContextProps['languageNamespaceStatus']>({});

    const languageContextValue: LanguageContextProps = useMemo(() => ({
        currentLanguage,
        setCurrentLanguage,
        strings,
        setStrings,
        languageNamespaceStatus,
        setLanguageNamespaceStatus,
        registerNamespace: noOp,
    }), [currentLanguage, strings, languageNamespaceStatus]);

    return languageContextValue;
}

export default useLanguageContextProviderValue;
