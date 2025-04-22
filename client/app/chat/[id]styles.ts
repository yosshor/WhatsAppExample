import { StyleSheet } from 'react-native';
export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E5DDD5',
        
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#075E54',
        height: 60,
    },
    backButton: {
        padding: 10,
    },
    headerAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
    },
    headerInfo: {
        flex: 1,
    },
    headerName: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    headerStatus: {
        color: '#FFFFFF',
        fontSize: 14,
        opacity: 0.8,
    },
    chatList: {
        flex: 1,
        gap: 10,
    },
    chatContent: {
        flex: 1,
        padding: 10,
    },
    messageRow: {
        flexDirection: 'row',
        marginVertical: 5,
        alignItems: 'flex-end',
        maxWidth: '80%',
        
    },
    myMessageRow: {
        alignSelf: 'flex-end',
        marginLeft: 'auto',
        backgroundColor: '#DCF8C6',
        flexDirection: 'row',
    },
    theirMessageRow: {
        alignSelf: 'flex-start',
        backgroundColor: '#ffffff',
    },
    avatar: {
        width: 35,
        height: 35,
        borderRadius: 17.5,
        marginRight: 8,
        alignSelf: 'flex-end',
        marginBottom: 4,
        alignItems:'center',
        justifyContent:'center'
    },
    messageContainer: {
        flex: 1,
        borderRadius: 15,
        padding: 8,
        paddingBottom: 18,
        maxWidth: '100%',
    },
    myMessage: {
        backgroundColor: '#DCF8C6',
    },
    theirMessage: {
        backgroundColor: '#FFFFFF',
    },
    senderName: {
        fontSize: 12,
        color: '#075E54',
        marginBottom: 2,
        fontWeight: '500',
    },
    messageText: {
        fontSize: 15,
        color: '#000000',
        marginRight: 45, // Make space for timestamp
    },
    messageFooter: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        position: 'absolute',
        right: 8,
        bottom: 4,
    },
    timestamp: {
        fontSize: 11,
        color: '#7C8B95',
        marginRight: 3,
    },
    readStatus: {
        fontSize: 11,
        color: '#7C8B95',
        marginLeft: 2,
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 10,
        backgroundColor: '#F6F6F6',
        alignItems: 'flex-end',
    },
    input: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 8,
        marginRight: 10,
        maxHeight: 100,
        minHeight: 40,
    },
    sendButton: {
        backgroundColor: '#075E54',
        borderRadius: 20,
        paddingHorizontal: 20,
        paddingVertical: 8,
        justifyContent: 'center',
    },
    sendButtonDisabled: {
        backgroundColor: '#B1B1B1',
    },
    sendButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});