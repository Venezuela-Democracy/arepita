export const formatMessage = (text: string): string => {
    return text.trim();
};

export const isValidCommand = (text: string): boolean => {
    return text.startsWith('/');
};

export const extractCommandArgs = (text: string): string[] => {
    return text.split(' ').slice(1);
};